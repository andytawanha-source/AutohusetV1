// Edge Function: plate-lookup
// Server-side nummerpladeopslag med provider-abstraktion, rate limiting,
// feature flag og logging uden eksponering af API-nøgler (spec pkt. 11).
// deno-lint-ignore-file no-explicit-any

import { createClient } from "npm:@supabase/supabase-js@2";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

interface NormalizedResult {
  provider: string;
  isMock: boolean;
  registrationNumber: string;
  make?: string;
  model?: string;
  variant?: string;
  modelYear?: number;
  firstRegistrationDate?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  engineSize?: number;
  powerHp?: number;
  powerKw?: number;
  batteryCapacityKwh?: number;
  electricRangeKm?: number;
  curbWeightKg?: number;
  totalWeightKg?: number;
  registrationStatus?: string;
  inspectionDate?: string;
  nextInspectionDate?: string;
  equipment?: string[];
  rawProviderData?: Record<string, unknown>;
}

const PLATE_RE = /^[A-ZÆØÅ0-9]{2,7}$/;
const MAX_PER_MINUTE_PER_IP = 5;
const MAX_PER_HOUR_PER_IP = 20;
const TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

/** Mock-provider – bruges når VEHICLE_LOOKUP_PROVIDER=mock eller mangler. */
function mockLookup(plate: string): NormalizedResult | null {
  if (plate.startsWith("XX")) return null;
  const templates = [
    { make: "Volkswagen", model: "Golf", variant: "1.5 TSI Style", modelYear: 2019, fuelType: "Benzin", transmission: "Manuel", color: "Grå" },
    { make: "Toyota", model: "Corolla", variant: "1.8 Hybrid Active", modelYear: 2021, fuelType: "Hybrid", transmission: "Automatisk", color: "Sort" },
    { make: "Tesla", model: "Model Y", variant: "Long Range AWD", modelYear: 2022, fuelType: "El", transmission: "Automatisk", color: "Hvid", batteryCapacityKwh: 75, electricRangeKm: 533 },
    { make: "Ford", model: "Focus", variant: "1.0 EcoBoost Titanium", modelYear: 2018, fuelType: "Benzin", transmission: "Manuel", color: "Blå" },
  ];
  let h = 0;
  for (const ch of plate) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { provider: "mock", isMock: true, registrationNumber: plate, ...templates[h % templates.length] };
}

/**
 * Generisk HTTP-provider. Feltmapningen SKAL tilpasses den valgte leverandørs
 * dokumentation, når kontrakten er på plads (se docs/PLAN-06-EKSTERNE-KONTI.md).
 */
async function httpProviderLookup(plate: string, provider: string): Promise<NormalizedResult | null> {
  const baseUrl = Deno.env.get("VEHICLE_LOOKUP_API_URL");
  const apiKey = Deno.env.get("VEHICLE_LOOKUP_API_KEY");
  if (!baseUrl || !apiKey) throw new Error("Provider er ikke konfigureret");

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Provider svarede HTTP ${res.status}`);
      const data: any = await res.json();

      // TODO ved leverandørvalg: præcis feltmapping pr. provider
      return {
        provider,
        isMock: false,
        registrationNumber: plate,
        make: data.make ?? data.maerke,
        model: data.model,
        variant: data.variant,
        modelYear: data.modelYear ?? data.model_year,
        firstRegistrationDate: data.firstRegistrationDate ?? data.first_registration,
        fuelType: data.fuelType ?? data.fuel,
        transmission: data.transmission,
        bodyType: data.bodyType ?? data.body_type,
        color: data.color,
        engineSize: data.engineSize,
        powerHp: data.powerHp ?? data.hp,
        powerKw: data.powerKw ?? data.kw,
        batteryCapacityKwh: data.batteryCapacityKwh,
        electricRangeKm: data.electricRangeKm,
        curbWeightKg: data.curbWeightKg,
        totalWeightKg: data.totalWeightKg,
        registrationStatus: data.registrationStatus,
        inspectionDate: data.inspectionDate,
        nextInspectionDate: data.nextInspectionDate,
        equipment: data.equipment,
        rawProviderData: data, // Gemmes kun hvis leverandørens licens tillader det
      };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== "POST") return jsonResponse({ status: "error" }, 405);

  const started = Date.now();
  const supabase = adminClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await sha256(ip);

  let plate = "";
  try {
    const body = await req.json();
    plate = String(body?.registrationNumber ?? "").replace(/[\s\-.]/g, "").toUpperCase();
  } catch {
    return jsonResponse({ status: "error" }, 400);
  }
  if (!PLATE_RE.test(plate)) return jsonResponse({ status: "error", message: "Ugyldig nummerplade" }, 400);

  const plateHash = await sha256(plate);

  const log = async (status: string, errorCode?: string) => {
    try {
      await supabase.from("vehicle_lookup_logs").insert({
        plate_hash: plateHash,
        provider: Deno.env.get("VEHICLE_LOOKUP_PROVIDER") ?? "mock",
        status,
        duration_ms: Date.now() - started,
        error_code: errorCode ?? null,
        ip_hash: ipHash,
      });
    } catch (err) {
      console.error("lookup-log fejlede:", err);
    }
  };

  // Feature flag
  if ((Deno.env.get("VEHICLE_LOOKUP_ENABLED") ?? "true") === "false") {
    await log("disabled");
    return jsonResponse({ status: "disabled" });
  }

  // Rate limiting pr. IP (autoritativ, baseret på logtabellen)
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: minuteCount } = await supabase
    .from("vehicle_lookup_logs")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneMinuteAgo);
  const { count: hourCount } = await supabase
    .from("vehicle_lookup_logs")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);
  if ((minuteCount ?? 0) >= MAX_PER_MINUTE_PER_IP || (hourCount ?? 0) >= MAX_PER_HOUR_PER_IP) {
    await log("rate_limited");
    return jsonResponse({ status: "rate_limited" }, 429);
  }

  const provider = Deno.env.get("VEHICLE_LOOKUP_PROVIDER") ?? "mock";
  try {
    const result = provider === "mock" ? mockLookup(plate) : await httpProviderLookup(plate, provider);
    if (!result) {
      await log("not_found");
      return jsonResponse({ status: "not_found" });
    }
    await log("success");
    return jsonResponse({ status: "success", result });
  } catch (err) {
    console.error("Opslag fejlede:", err instanceof Error ? err.message : err);
    await log("error", "PROVIDER_ERROR");
    return jsonResponse({ status: "error" }, 502);
  }
});
