import type { RentalDetails, SaleDetails, Vehicle } from "@/features/vehicles/types";

/** Bil med private adminfelter (eksponeres aldrig offentligt). */
export interface AdminVehicle extends Vehicle {
  internalNotes: string | null;
  vin: string | null;
  publishAt: string | null;
  updatedAt: string;
  saleDetails: SaleDetails | null;
  rentalDetails: RentalDetails | null;
}

export type AdminLeadStatus =
  | "new"
  | "in_progress"
  | "contact_attempted"
  | "contacted"
  | "awaiting_info"
  | "assessed"
  | "offer_sent"
  | "accepted"
  | "rejected"
  | "won"
  | "lost"
  | "archived";

export const LEAD_STATUS_LABELS: Record<AdminLeadStatus, string> = {
  new: "Ny",
  in_progress: "Under behandling",
  contact_attempted: "Kontakt forsøgt",
  contacted: "Kontaktet",
  awaiting_info: "Afventer information",
  assessed: "Vurderet",
  offer_sent: "Tilbud sendt",
  accepted: "Accepteret",
  rejected: "Afvist",
  won: "Vundet",
  lost: "Tabt",
  archived: "Arkiveret",
};

export interface AdminLead {
  id: string;
  reference: string;
  status: AdminLeadStatus;
  registrationNumber: string;
  mileageKm: number | null;
  source: string;
  createdAt: string;
  assignedTo: string | null;
  followUpAt: string | null;
  lostReason: string | null;
  contact: {
    name: string;
    phone: string;
    email: string;
    postalCode: string | null;
    city: string | null;
    preferredChannel: string | null;
    bestContactTime: string | null;
    message: string | null;
  } | null;
  vehicle: {
    make: string | null;
    model: string | null;
    variant: string | null;
    modelYear: number | null;
    fuelType: string | null;
    transmission: string | null;
    color: string | null;
    provider: string;
    isMock: boolean;
  } | null;
}

export interface AdminLeadDetail extends AdminLead {
  condition: Record<string, unknown> | null;
  consents: Array<{ type: string; granted: boolean; version: string; channels: string[]; createdAt: string }>;
  attribution: {
    landingPage: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    deviceType: string | null;
  } | null;
  images: Array<{ id: string; url: string; category: string | null }>;
  notes: Array<{ id: string; author: string; body: string; createdAt: string }>;
  history: Array<{ from: string | null; to: string; at: string; by: string }>;
}
