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
};

/**
 * Bilbasens forhandlerside er server-renderet HTML (ingen offentligt API), så vi
 * parser annonceblokkene med regex frem for en fuld DOM-parser (holder funktionen
 * let). Hvert "[Titel](/brugt/bil/.../<id>)"-link markerer en ny annonce; km, årgang
 * og pris står i de efterfølgende linjer/celler. Justér mønstrene her (markeret
 * TODO), hvis Bilbasen ændrer sidens opbygning.
 */
function parseDealerPage(html: string): ParsedListing[] {
  const listings: ParsedListing[] = [];

  // Matcher "<a href="/brugt/bil/<mærke>/<model>/<variant-slug>/<id>">Titel</a>"
  const linkRe = /href="(\/brugt\/bil\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)\/(\d+))"[^>]*>\s*([^<]+?)\s*</gi;
  const matches = [...html.matchAll(linkRe)];

  for (const m of matches) {
    const [, path, makeSlug, modelSlug, , externalId, titleRaw] = m;
    const title = titleRaw.trim();
    if (!title || listings.some((l) => l.externalId === externalId)) continue;

    // Søger km/årgang/pris i et vindue af tekst lige efter linket (samme rækkefølge
    // som Bilbasen viser dem: "<km> · <km/l> · <årgang> · <pris> kr.").
    const windowStart = m.index ?? 0;
    const windowText = html.slice(windowStart, windowStart + 4000);

    const priceMatch = windowText.match(/([\d.]{4,10})\s*kr\.?/);
    const yearMatch = windowText.match(/\b(19|20)\d{2}\b/);
    const kmMatch = windowText.match(/\b([\d.]{2,8})\b(?!\s*kr)/g);

    const priceDkk = priceMatch ? Number(priceMatch[1].replace(/\./g, "")) : null;
    const modelYear = yearMatch ? Number(yearMatch[0]) : null;
    // Kilometertal er typisk det første "rene" tal > 500 i vinduet (adskiller det fra
    // dørantal, sædeantal osv., som også kan matche \d+ mønstre andre steder).
    const mileageKm = kmMatch
      ? (kmMatch.map((v) => Number(v.replace(/\./g, ""))).find((n) => n >= 500 && n < 900_000) ?? null)
      : null;

    listings.push({
      externalId,
      externalUrl: `https://www.bilbasen.dk${path}`,
      title,
      make: titleCase(makeSlug.replace(/-/g, " ")),
      model: titleCase(modelSlug.replace(/-/g, " ")),
      variant: title.replace(new RegExp(`^${escapeRe(titleCase(makeSlug.replace(/-/g, " ")))}\\s+`, "i"), "") || null,
      modelYear,
      mileageKm,
      priceDkk,
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
        slug,
        // vehicle_status-enum har ikke "available" – "published" er den offentligt
        // synlige status (se 0001-migrationen).
        status: "published",
        external_source: "bilbasen",
        external_id: listing.externalId,
        external_url: listing.externalUrl,
        last_synced_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("vehicles").update(row).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("vehicles").insert(row);
        created++;
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
