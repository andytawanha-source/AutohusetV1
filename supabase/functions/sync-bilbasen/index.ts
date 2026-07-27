// Edge Function: sync-bilbasen
//
// Henter Autohuset Vests forhandlerside på Bilbasen og synkroniserer bilerne ind i
// vehicles-tabellen (listing_type = 'sale'), så "Biler til salg" på hjemmesiden altid
// afspejler det aktuelle Bilbasen-lager uden manuel indtastning to steder.
//
// Kaldes periodisk (se DEPLOYMENT.md / API-INTEGRATION.md for opsætning af et cron-kald,
// fx via Supabase Scheduled Functions eller pg_cron + pg_net). Kan også kaldes manuelt
// fra adminpanelet ("Synkroniser fra Bilbasen"-knap, når den er koblet på).
//
// VIGTIGT (se LEGAL-CHECKLIST.md): Der hentes udelukkende offentligt tilgængelige
// annoncedata fra forhandlerens EGEN side på Bilbasen (annoncer Autohuset selv har
// oprettet) – ikke data om andre forhandlere. Bilbasens vilkår bør alligevel
// gennemgås/afklares med Bilbasen, før dette køres i produktion i stor skala, og
// scraperen bør høfligt begrænse hyppigheden (se SYNC_MIN_INTERVAL_MINUTES).
// deno-lint-ignore-file no-explicit-any

import { createClient } from "npm:@supabase/supabase-js@2";
import { parse as parseHtml } from "npm:node-html-parser@6";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

const DEALER_URL = Deno.env.get("BILBASEN_DEALER_URL") ??
  "https://www.bilbasen.dk/find-en-forhandler/bilforhandler-autohuset-v-aps-id22288";
const ORGANIZATION_ID = Deno.env.get("BILBASEN_ORGANIZATION_ID") ?? "";

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ParsedListing = {
  externalId: string;
  externalUrl: string;
  title: string;
  make: string;
  model: string;
  variant: string | null;
  modelYear: number | null;
  mileageKm: number | null;
  priceDkk: number | null;
  description: string | null;
  imageUrls: string[];
};

/** Bilbasens billed-CDN understøtter en størrelses-parameter i URL'en – vi beder om
 * en større udgave end den lille thumbnail-størrelse siden selv linker til. */
function upsizeImageUrl(url: string): string {
  return url.replace(/class=RS\d+X\d+/, "class=RS960X720");
}

/**
 * Bilbasens forhandlerside er server-renderet HTML (ingen offentligt API). Struktur
 * verificeret direkte i browserens DOM (juli 2026):
 *   a.listing-heading                     → titel + href ".../<make>/<model>/<variant>/<id>"
 *   (nærmeste) .bb-listing-clickable       → hele annonce-kortet
 *     .col-xs-6 .listing-data (4 stk.)     → [by, forbrug ("xx km/l"), km, årgang]
 *     .listing-price                       → "57.499 kr."
 *     .listing-description                 → fuld annoncetekst
 *     img[src*="billeder.bilbasen.dk"]      → hovedbillede + små thumbnails
 * Justér selectorerne her (markeret TODO), hvis Bilbasen ændrer sidens opbygning –
 * check nemmest ved at inspicere DOM'en på forhandlersiden i browserens devtools.
 */
function parseDealerPage(html: string): ParsedListing[] {
  const root = parseHtml(html);
  const listings: ParsedListing[] = [];

  const headings = root.querySelectorAll("a.listing-heading");
  for (const heading of headings) {
    const href = heading.getAttribute("href");
    const title = heading.textContent.trim();
    if (!href || !title) continue;

    const linkMatch = href.match(/^\/brugt\/bil\/([a-z0-9-]+)\/([a-z0-9-]+)\/[a-z0-9-]+\/(\d+)/i);
    if (!linkMatch) continue;
    const [, makeSlug, modelSlug, externalId] = linkMatch;
    if (listings.some((l) => l.externalId === externalId)) continue;

    const card = heading.closest(".bb-listing-clickable") ?? heading.closest(".listing") ?? root;

    const dataCells = card.querySelectorAll(".listing-data").map((c) => c.textContent.trim());
    // Rækkefølge på Bilbasen: [by, forbrug ("xx km/l"), km, årgang] – vi matcher på
    // indhold frem for fast position, så det er robust over for en manglende celle.
    const yearCell = dataCells.find((c) => /^(19|20)\d{2}$/.test(c));
    const kmCell = dataCells.find((c) => /^[\d.]+$/.test(c) && c !== yearCell);

    const priceText = card.querySelector(".listing-price")?.textContent ?? "";
    const priceMatch = priceText.match(/([\d.]{4,10})\s*kr/);

    const description = card.querySelector(".listing-description")?.textContent.trim().replace(/\n{3,}/g, "\n\n") ?? null;

    const imageUrls = card
      .querySelectorAll("img")
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => Boolean(src) && src!.includes("billeder.bilbasen.dk"))
      .map(upsizeImageUrl)
      // Første billede går igen som både stort billede og lille thumbnail i DOM'en –
      // fjern dubletter (samme fil-id, uanset størrelsesparameter).
      .filter((src, i, arr) => arr.findIndex((s) => s.split("?")[0] === src.split("?")[0]) === i);

    const make = titleCase(makeSlug.replace(/-/g, " "));
    const model = titleCase(modelSlug.replace(/-/g, " "));
    // Bilbasens titel er "<Mærke> <Model> <variant...>" – vi fjerner mærke+model fra
    // starten (case-insensitivt) for at undgå at de gentages i variant-feltet.
    const variant =
      title.replace(new RegExp(`^${escapeRe(make)}\\s+${escapeRe(model)}\\s*`, "i"), "").trim() || null;

    listings.push({
      externalId,
      externalUrl: `https://www.bilbasen.dk${href}`,
      title,
      make,
      model,
      variant,
      modelYear: yearCell ? Number(yearCell) : null,
      mileageKm: kmCell ? Number(kmCell.replace(/\./g, "")) : null,
      priceDkk: priceMatch ? Number(priceMatch[1].replace(/\./g, "")) : null,
      description,
      imageUrls,
    });
  }

  return listings;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (!ORGANIZATION_ID) {
    return jsonResponse({ error: "BILBASEN_ORGANIZATION_ID secret er ikke sat." }, 500);
  }

  try {
    const res = await fetch(DEALER_URL, {
      headers: { "User-Agent": "AutohusetVestSync/1.0 (+https://autohusetvest.dk)" },
    });
    if (!res.ok) {
      return jsonResponse({ error: `Kunne ikke hente Bilbasen-siden (status ${res.status}).` }, 502);
    }
    const html = await res.text();
    const listings = parseDealerPage(html);

    const supabase = getServiceClient();
    let created = 0;
    let updated = 0;

    for (const listing of listings) {
      const slug = `${slugify(listing.title)}-${listing.externalId}`;
      const { data: existing } = await supabase
        .from("vehicles")
        .select("id")
        .eq("organization_id", ORGANIZATION_ID)
        .eq("external_source", "bilbasen")
        .eq("external_id", listing.externalId)
        .maybeSingle();

      const row = {
        organization_id: ORGANIZATION_ID,
        listing_type: "sale",
        make: listing.make,
        model: listing.model,
        variant: listing.variant,
        model_year: listing.modelYear,
        mileage_km: listing.mileageKm,
        price_dkk: listing.priceDkk,
        description: listing.description,
        slug,
        // vehicle_status-enum har ikke "available" – "published" er den offentligt
        // synlige status (se 0001-migrationen).
        status: "published",
        external_source: "bilbasen",
        external_id: listing.externalId,
        external_url: listing.externalUrl,
        last_synced_at: new Date().toISOString(),
      };

      let vehicleId = existing?.id as string | undefined;
      if (existing) {
        await supabase.from("vehicles").update(row).eq("id", existing.id);
        updated++;
      } else {
        const { data: inserted } = await supabase.from("vehicles").insert(row).select("id").single();
        vehicleId = inserted?.id;
        created++;
      }

      if (vehicleId && listing.imageUrls.length) {
        // Simplest robuste tilgang: fjern gamle billeder for denne bil og indsæt de
        // aktuelle igen – billed-URL'erne peger direkte på Bilbasens CDN, så der
        // uploades intet til vores egen storage.
        await supabase.from("vehicle_images").delete().eq("vehicle_id", vehicleId);
        await supabase.from("vehicle_images").insert(
          listing.imageUrls.map((url, i) => ({
            organization_id: ORGANIZATION_ID,
            vehicle_id: vehicleId,
            storage_path: url,
            alt_text: `${listing.make} ${listing.model}`,
            sort_order: i,
            is_primary: i === 0,
          })),
        );
      }
    }

    // Biler der ikke længere findes i Bilbasen-opslaget (solgt/fjernet) markeres som
    // solgte i stedet for at blive slettet, så historik/leads der peger på dem bevares.
    const currentIds = listings.map((l) => l.externalId);
    const { data: staleRows } = await supabase
      .from("vehicles")
      .select("id")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("external_source", "bilbasen")
      .eq("status", "published")
      .not("external_id", "in", `(${currentIds.map((id) => `"${id}"`).join(",") || '""'})`);

    let markedSold = 0;
    if (staleRows?.length) {
      await supabase
        .from("vehicles")
        .update({ status: "sold", sold_at: new Date().toISOString() })
        .in("id", staleRows.map((r) => r.id));
      markedSold = staleRows.length;
    }

    return jsonResponse({ ok: true, found: listings.length, created, updated, markedSold });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Ukendt fejl" }, 500);
  }
});
