import type { BrandConfig } from "./brand.types";

/**
 * Autohuset Vest – nordisk, åben og imødekommende.
 * Farver fra spec: primær #0D3B45, sekundær #164E63, accent #5BC0EB,
 * baggrund #F5F2EA, varm neutral #E8D7B5, tekst #102A33.
 */
export const autohusetVest: BrandConfig = {
  key: "autohuset-vest",
  name: "Autohuset Vest",
  domain: "[AUTOHUSET VEST DOMÆNE]",
  colors: {
    primary: "13 59 69", // #0D3B45
    secondary: "22 78 99", // #164E63
    accent: "91 192 235", // #5BC0EB
    surface: "245 242 234", // #F5F2EA
    surfaceWarm: "232 215 181", // #E8D7B5
    ink: "16 42 51", // #102A33
  },
  fonts: {
    display: "'Outfit'",
    body: "'Inter'",
  },
  contact: {
    legalName: "[AUTOHUSET VEST JURIDISK NAVN]",
    cvr: "[AUTOHUSET VEST CVR]",
    address: "[AUTOHUSET VEST ADRESSE]",
    phone: "[AUTOHUSET VEST TELEFON]",
    email: "[AUTOHUSET VEST E-MAIL]",
    leadEmail: "[AUTOHUSET VEST LEAD-E-MAIL]",
  },
  openingHours: [
    { label: "Mandag–fredag", hours: "09:00–17:30" },
    { label: "Lørdag", hours: "10:00–15:00" },
    { label: "Søndag", hours: "Lukket" },
  ],
  social: {
    facebook: "[AUTOHUSET VEST FACEBOOK]",
    instagram: "[AUTOHUSET VEST INSTAGRAM]",
  },
  seo: {
    defaultTitle: "Autohuset Vest – Kvalitetsbiler og fair bilvurdering",
    titleTemplate: "%s | Autohuset Vest",
    defaultDescription:
      "Se vores udvalg af kvalitetsbiler, eller få et uforpligtende tilbud på din bil med det samme. Autohuset Vest – tryg bilhandel i Vestdanmark.",
  },
  leadResponseTime: "inden for 24 timer på hverdage",
  leadReferencePrefix: "AVEST",
};
