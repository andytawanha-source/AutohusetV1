import { getDemoVehicles } from "@/features/vehicles/demoData";
import type { Vehicle } from "@/features/vehicles/types";
import type { AdminLead, AdminLeadDetail, AdminVehicle } from "./types";

/**
 * In-memory demodatalager til adminpanelet, når Supabase ikke er konfigureret.
 * Ændringer lever kun i browsersessionen og er tydeligt markeret TESTDATA.
 */

let vehicles: AdminVehicle[] | null = null;
let leads: AdminLeadDetail[] | null = null;

function toAdminVehicle(v: Vehicle): AdminVehicle {
  return { ...v, internalNotes: null, vin: null, publishAt: null, updatedAt: v.createdAt };
}

export function demoVehicles(): AdminVehicle[] {
  if (!vehicles) {
    vehicles = getDemoVehicles().map(toAdminVehicle);
    // Tilføj en kladde, som kun findes i admin
    vehicles.push({
      ...toAdminVehicle(getDemoVehicles()[0]),
      id: "demo-draft-1",
      make: "Audi",
      model: "A4",
      variant: "Avant 40 TFSI",
      slug: "audi-a4-avant-40-tfsi-2021",
      status: "draft",
      priceDkk: 274900,
      mileageKm: 67000,
      modelYear: 2021,
      badges: [],
      isFeatured: false,
      internalNotes: "TESTDATA: Kladde – afventer billeder.",
      images: [],
    });
  }
  return vehicles;
}

export function demoSaveVehicle(vehicle: AdminVehicle): AdminVehicle {
  const list = demoVehicles();
  const idx = list.findIndex((v) => v.id === vehicle.id);
  const saved = { ...vehicle, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = saved;
  else list.unshift({ ...saved, id: `demo-new-${Date.now()}`, createdAt: new Date().toISOString() });
  return saved;
}

export function demoDeleteVehicle(id: string): void {
  const list = demoVehicles();
  const idx = list.findIndex((v) => v.id === id);
  if (idx >= 0) list.splice(idx, 1);
}

const DEMO_LEADS: AdminLeadDetail[] = [
  {
    id: "demo-lead-1",
    reference: "AVEST-2026-0001",
    status: "new",
    registrationNumber: "AB12345",
    mileageKm: 87000,
    source: "website",
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    assignedTo: null,
    followUpAt: null,
    lostReason: null,
    contact: { name: "Test Testesen (TESTDATA)", phone: "+45 00 00 00 01", email: "test1@example.invalid", postalCode: "6700", city: "Esbjerg", preferredChannel: "phone", bestContactTime: "Eftermiddag", message: "Vil gerne sælge hurtigt." },
    vehicle: { make: "Volkswagen", model: "Golf", variant: "1.4 TSI", modelYear: 2017, fuelType: "Benzin", transmission: "Manuel", color: "Grå", provider: "mock", isMock: true },
    condition: { isDrivable: true, hasServiceBook: true, keyCount: 2, knownDamages: "Lille ridse på bagkofanger", smokeFree: true, hasOutstandingFinance: false, saleTimeline: "Hurtigst muligt" },
    consents: [
      { type: "processing", granted: true, version: "v0.1", channels: [], createdAt: new Date().toISOString() },
      { type: "marketing", granted: false, version: "v0.1", channels: [], createdAt: new Date().toISOString() },
    ],
    attribution: { landingPage: "/saelg-din-bil", utmSource: null, utmMedium: null, utmCampaign: null, deviceType: "mobile" },
    images: [],
    notes: [],
    history: [{ from: null, to: "new", at: new Date(Date.now() - 3 * 3600_000).toISOString(), by: "System" }],
  },
  {
    id: "demo-lead-2",
    reference: "AVEST-2026-0002",
    status: "contacted",
    registrationNumber: "CD67890",
    mileageKm: 145000,
    source: "website",
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    assignedTo: "Demo Administrator (TESTDATA)",
    followUpAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
    lostReason: null,
    contact: { name: "Demo Demosen (TESTDATA)", phone: "+45 00 00 00 02", email: "test2@example.invalid", postalCode: "7100", city: "Vejle", preferredChannel: "email", bestContactTime: "Formiddag", message: null },
    vehicle: { make: "Ford", model: "Focus", variant: "1.0 EcoBoost", modelYear: 2015, fuelType: "Benzin", transmission: "Manuel", color: "Blå", provider: "mock", isMock: true },
    condition: { isDrivable: true, hasServiceBook: false, keyCount: 1, knownDamages: null, smokeFree: true, hasOutstandingFinance: true, saleTimeline: "Inden for en måned" },
    consents: [
      { type: "processing", granted: true, version: "v0.1", channels: [], createdAt: new Date().toISOString() },
      { type: "marketing", granted: true, version: "v0.1", channels: ["email"], createdAt: new Date().toISOString() },
    ],
    attribution: { landingPage: "/", utmSource: "google", utmMedium: "cpc", utmCampaign: "saelg-din-bil-demo", deviceType: "desktop" },
    images: [],
    notes: [{ id: "n1", author: "Demo Administrator (TESTDATA)", body: "Ringet – ønsker tilbud på e-mail.", createdAt: new Date(Date.now() - 20 * 3600_000).toISOString() }],
    history: [
      { from: null, to: "new", at: new Date(Date.now() - 26 * 3600_000).toISOString(), by: "System" },
      { from: "new", to: "contacted", at: new Date(Date.now() - 20 * 3600_000).toISOString(), by: "Demo Administrator (TESTDATA)" },
    ],
  },
  {
    id: "demo-lead-3",
    reference: "AVEST-2026-0003",
    status: "offer_sent",
    registrationNumber: "EF11223",
    mileageKm: 62000,
    source: "website",
    createdAt: new Date(Date.now() - 72 * 3600_000).toISOString(),
    assignedTo: "Demo Administrator (TESTDATA)",
    followUpAt: null,
    lostReason: null,
    contact: { name: "Fiktiv Person (TESTDATA)", phone: "+45 00 00 00 03", email: "test3@example.invalid", postalCode: "6000", city: "Kolding", preferredChannel: "sms", bestContactTime: null, message: "Bilen står i carport." },
    vehicle: { make: "Toyota", model: "C-HR", variant: "1.8 Hybrid", modelYear: 2019, fuelType: "Hybrid", transmission: "Automatisk", color: "Sort", provider: "mock", isMock: true },
    condition: { isDrivable: true, hasServiceBook: true, keyCount: 2, knownDamages: null, smokeFree: true, hasOutstandingFinance: false, saleTimeline: "Undersøger prisen" },
    consents: [{ type: "processing", granted: true, version: "v0.1", channels: [], createdAt: new Date().toISOString() }],
    attribution: { landingPage: "/saelg-din-bil", utmSource: "facebook", utmMedium: "paid_social", utmCampaign: "brand-demo", deviceType: "mobile" },
    images: [],
    notes: [],
    history: [{ from: null, to: "new", at: new Date(Date.now() - 72 * 3600_000).toISOString(), by: "System" }],
  },
];

export function demoLeads(): AdminLeadDetail[] {
  if (!leads) leads = DEMO_LEADS.map((l) => ({ ...l }));
  return leads;
}

export function demoLeadById(id: string): AdminLeadDetail | undefined {
  return demoLeads().find((l) => l.id === id);
}

export function demoUpdateLead(id: string, patch: Partial<AdminLead>): void {
  const lead = demoLeadById(id);
  if (lead) Object.assign(lead, patch);
}
