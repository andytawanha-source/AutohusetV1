import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { vehicleSlug } from "@/lib/slug";
import { useAdminAuth } from "./auth";
import {
  demoDeleteVehicle,
  demoLeadById,
  demoLeads,
  demoSaveVehicle,
  demoUpdateLead,
  demoVehicles,
} from "./demoStore";
import type { AdminLead, AdminLeadDetail, AdminLeadStatus, AdminVehicle } from "./types";

/* ============================ Biler ============================ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdminVehicle(row: any): AdminVehicle {
  return {
    id: row.id,
    organizationId: row.organization_id,
    make: row.make,
    model: row.model,
    variant: row.variant,
    modelYear: row.model_year,
    firstRegistration: row.first_registration,
    mileageKm: row.mileage_km,
    priceDkk: row.price_dkk,
    monthlyPriceDkk: row.monthly_price_dkk,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    bodyType: row.body_type,
    color: row.color,
    doors: row.doors,
    seats: row.seats,
    powerHp: row.power_hp,
    engine: row.engine,
    batteryKwh: row.battery_kwh,
    rangeKm: row.range_km,
    consumption: row.consumption,
    taxPeriodDkk: row.tax_period_dkk,
    registrationNumber: row.registration_number,
    showRegistrationNumber: row.show_registration_number,
    description: row.description,
    equipment: row.equipment ?? [],
    badges: row.badges ?? [],
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    slug: row.slug,
    status: row.status,
    soldAt: row.sold_at,
    createdAt: row.created_at,
    images: (row.vehicle_images ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((img: any) => ({
        id: img.id,
        url: img.storage_path?.startsWith("http")
          ? img.storage_path
          : getSupabase().storage.from("vehicle-images").getPublicUrl(img.storage_path).data.publicUrl,
        altText: img.alt_text ?? "",
        isPrimary: img.is_primary,
        sortOrder: img.sort_order,
      })),
    internalNotes: row.internal_notes,
    vin: row.vin,
    publishAt: row.publish_at,
    updatedAt: row.updated_at,
  };
}

export function useAdminVehicles() {
  const { user } = useAdminAuth();
  return useQuery({
    queryKey: ["admin", "vehicles"],
    enabled: !!user,
    queryFn: async (): Promise<AdminVehicle[]> => {
      if (!isSupabaseConfigured) return [...demoVehicles()];
      const { data, error } = await getSupabase()
        .from("vehicles")
        .select("*, vehicle_images(*)")
        .eq("organization_id", user!.organizationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapAdminVehicle);
    },
  });
}

export interface VehicleFormValues {
  id?: string;
  make: string;
  model: string;
  variant: string;
  modelYear: string;
  firstRegistration: string;
  mileageKm: string;
  priceDkk: string;
  monthlyPriceDkk: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  doors: string;
  seats: string;
  powerHp: string;
  engine: string;
  batteryKwh: string;
  rangeKm: string;
  consumption: string;
  taxPeriodDkk: string;
  registrationNumber: string;
  showRegistrationNumber: boolean;
  vin: string;
  description: string;
  internalNotes: string;
  equipment: string; // linjeadskilt
  badges: string[];
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  status: string;
  publishAt: string;
}

const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

export function useSaveVehicle() {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: VehicleFormValues): Promise<void> => {
      const slug =
        form.slug.trim() ||
        vehicleSlug({ make: form.make, model: form.model, variant: form.variant, year: num(form.modelYear) ?? undefined });

      if (!isSupabaseConfigured) {
        const existing = form.id ? demoVehicles().find((v) => v.id === form.id) : undefined;
        demoSaveVehicle({
          ...(existing ?? {
            id: form.id ?? "",
            organizationId: user!.organizationId,
            createdAt: new Date().toISOString(),
            images: [],
            soldAt: null,
          }),
          make: form.make,
          model: form.model,
          variant: form.variant || null,
          modelYear: num(form.modelYear),
          firstRegistration: form.firstRegistration || null,
          mileageKm: num(form.mileageKm),
          priceDkk: num(form.priceDkk),
          monthlyPriceDkk: num(form.monthlyPriceDkk),
          fuelType: (form.fuelType || null) as AdminVehicle["fuelType"],
          transmission: (form.transmission || null) as AdminVehicle["transmission"],
          bodyType: form.bodyType || null,
          color: form.color || null,
          doors: num(form.doors),
          seats: num(form.seats),
          powerHp: num(form.powerHp),
          engine: form.engine || null,
          batteryKwh: num(form.batteryKwh),
          rangeKm: num(form.rangeKm),
          consumption: form.consumption || null,
          taxPeriodDkk: num(form.taxPeriodDkk),
          registrationNumber: form.registrationNumber || null,
          showRegistrationNumber: form.showRegistrationNumber,
          vin: form.vin || null,
          description: form.description || null,
          internalNotes: form.internalNotes || null,
          equipment: form.equipment.split("\n").map((s) => s.trim()).filter(Boolean),
          badges: form.badges,
          isFeatured: form.isFeatured,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          slug,
          status: form.status as AdminVehicle["status"],
          publishAt: form.publishAt || null,
          updatedAt: new Date().toISOString(),
        } as AdminVehicle);
        return;
      }

      const payload = {
        organization_id: user!.organizationId,
        make: form.make,
        model: form.model,
        variant: form.variant || null,
        model_year: num(form.modelYear),
        first_registration: form.firstRegistration || null,
        mileage_km: num(form.mileageKm),
        price_dkk: num(form.priceDkk),
        monthly_price_dkk: num(form.monthlyPriceDkk),
        fuel_type: form.fuelType || null,
        transmission: form.transmission || null,
        body_type: form.bodyType || null,
        color: form.color || null,
        doors: num(form.doors),
        seats: num(form.seats),
        power_hp: num(form.powerHp),
        engine: form.engine || null,
        battery_kwh: num(form.batteryKwh),
        range_km: num(form.rangeKm),
        consumption: form.consumption || null,
        tax_period_dkk: num(form.taxPeriodDkk),
        registration_number: form.registrationNumber || null,
        show_registration_number: form.showRegistrationNumber,
        vin: form.vin || null,
        description: form.description || null,
        internal_notes: form.internalNotes || null,
        equipment: form.equipment.split("\n").map((s) => s.trim()).filter(Boolean),
        badges: form.badges,
        is_featured: form.isFeatured,
        seo_title: form.seoTitle || null,
        seo_description: form.seoDescription || null,
        slug,
        status: form.status,
        publish_at: form.publishAt || null,
      };

      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("vehicles").update(payload).eq("id", form.id)
        : await supabase.from("vehicles").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useVehicleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      if (!isSupabaseConfigured) {
        for (const id of ids) {
          const v = demoVehicles().find((x) => x.id === id);
          if (v) v.status = status as AdminVehicle["status"];
        }
        return;
      }
      const { error } = await getSupabase().from("vehicles").update({ status }).in("id", ids);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        demoDeleteVehicle(id);
        return;
      }
      // Soft delete
      const { error } = await getSupabase()
        .from("vehicles")
        .update({ deleted_at: new Date().toISOString(), status: "archived" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] }),
  });
}

/* ============================ Leads ============================ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLead(row: any): AdminLead {
  const contact = row.lead_contacts?.[0] ?? row.lead_contacts ?? null;
  const snapshot = row.lead_vehicle_snapshots?.[0] ?? row.lead_vehicle_snapshots ?? null;
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    registrationNumber: row.registration_number,
    mileageKm: row.mileage_km,
    source: row.source,
    createdAt: row.created_at,
    assignedTo: row.assigned_profile?.full_name ?? null,
    followUpAt: row.follow_up_at,
    lostReason: row.lost_reason,
    contact: contact
      ? {
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          postalCode: contact.postal_code,
          city: contact.city,
          preferredChannel: contact.preferred_channel,
          bestContactTime: contact.best_contact_time,
          message: contact.message,
        }
      : null,
    vehicle: snapshot
      ? {
          make: snapshot.make,
          model: snapshot.model,
          variant: snapshot.variant,
          modelYear: snapshot.model_year,
          fuelType: snapshot.fuel_type,
          transmission: snapshot.transmission,
          color: snapshot.color,
          provider: snapshot.provider,
          isMock: snapshot.is_mock,
        }
      : null,
  };
}

export function useAdminLeads() {
  const { user } = useAdminAuth();
  return useQuery({
    queryKey: ["admin", "leads"],
    enabled: !!user,
    queryFn: async (): Promise<AdminLead[]> => {
      if (!isSupabaseConfigured) return [...demoLeads()];
      const { data, error } = await getSupabase()
        .from("leads")
        .select("*, lead_contacts(*), lead_vehicle_snapshots(*), assigned_profile:profiles!leads_assigned_to_fkey(full_name)")
        .eq("organization_id", user!.organizationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapLead);
    },
  });
}

export function useAdminLeadDetail(id: string | undefined) {
  const { user } = useAdminAuth();
  return useQuery({
    queryKey: ["admin", "lead", id],
    enabled: !!user && !!id,
    queryFn: async (): Promise<AdminLeadDetail | null> => {
      if (!isSupabaseConfigured) return demoLeadById(id!) ?? null;
      const supabase = getSupabase();
      const { data: row, error } = await supabase
        .from("leads")
        .select(
          "*, lead_contacts(*), lead_vehicle_snapshots(*), lead_condition_answers(*), lead_consents(*), lead_attribution(*), lead_images(*), lead_notes(*, author:profiles(full_name)), lead_status_history(*, changed_profile:profiles(full_name)), assigned_profile:profiles!leads_assigned_to_fkey(full_name)"
        )
        .eq("id", id!)
        .single();
      if (error) throw error;

      // Signerede URL'er til de private leadbilleder
      const images = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row.lead_images ?? []).map(async (img: any) => {
          const { data: signed } = await supabase.storage
            .from("lead-images")
            .createSignedUrl(img.storage_path, 3600);
          return { id: img.id, url: signed?.signedUrl ?? "", category: img.category };
        })
      );

      const base = mapLead(row);
      const conditionRow = row.lead_condition_answers?.[0] ?? null;
      return {
        ...base,
        condition: conditionRow,
        consents: (row.lead_consents ?? []).map((c: Record<string, unknown>) => ({
          type: c.consent_type as string,
          granted: c.granted as boolean,
          version: c.consent_text_version as string,
          channels: (c.channels as string[]) ?? [],
          createdAt: c.created_at as string,
        })),
        attribution: row.lead_attribution?.[0]
          ? {
              landingPage: row.lead_attribution[0].landing_page,
              utmSource: row.lead_attribution[0].utm_source,
              utmMedium: row.lead_attribution[0].utm_medium,
              utmCampaign: row.lead_attribution[0].utm_campaign,
              deviceType: row.lead_attribution[0].device_type,
            }
          : null,
        images: images.filter((i) => i.url),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notes: (row.lead_notes ?? []).map((n: any) => ({
          id: n.id,
          author: n.author?.full_name ?? "Ukendt",
          body: n.body,
          createdAt: n.created_at,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        history: (row.lead_status_history ?? []).map((h: any) => ({
          from: h.from_status,
          to: h.to_status,
          at: h.created_at,
          by: h.changed_profile?.full_name ?? "System",
        })),
      };
    },
  });
}

export function useUpdateLead() {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      lostReason,
      followUpAt,
      assignToSelf,
    }: {
      id: string;
      status?: AdminLeadStatus;
      lostReason?: string;
      followUpAt?: string | null;
      assignToSelf?: boolean;
    }) => {
      if (!isSupabaseConfigured) {
        demoUpdateLead(id, {
          ...(status ? { status } : {}),
          ...(lostReason !== undefined ? { lostReason } : {}),
          ...(followUpAt !== undefined ? { followUpAt } : {}),
          ...(assignToSelf ? { assignedTo: user!.name } : {}),
        });
        const lead = demoLeadById(id);
        if (lead && status) lead.history.push({ from: lead.history.at(-1)?.to ?? null, to: status, at: new Date().toISOString(), by: user!.name });
        return;
      }
      const patch: Record<string, unknown> = {};
      if (status) patch.status = status;
      if (lostReason !== undefined) patch.lost_reason = lostReason;
      if (followUpAt !== undefined) patch.follow_up_at = followUpAt;
      if (assignToSelf) patch.assigned_to = user!.id;
      const { error } = await getSupabase().from("leads").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      if (assignToSelf) {
        await getSupabase().from("lead_assignments").insert({
          organization_id: user!.organizationId,
          lead_id: id,
          assigned_to: user!.id,
          assigned_by: user!.id,
        });
      }
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "lead", vars.id] });
    },
  });
}

export function useAddLeadNote() {
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, body }: { leadId: string; body: string }) => {
      if (!isSupabaseConfigured) {
        demoLeadById(leadId)?.notes.push({
          id: `note-${Date.now()}`,
          author: user!.name,
          body,
          createdAt: new Date().toISOString(),
        });
        return;
      }
      const { error } = await getSupabase().from("lead_notes").insert({
        organization_id: user!.organizationId,
        lead_id: leadId,
        author_id: user!.id,
        body,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => void queryClient.invalidateQueries({ queryKey: ["admin", "lead", vars.leadId] }),
  });
}

/* ============================ CSV ============================ */

export function vehiclesToCsv(vehicles: AdminVehicle[]): string {
  const headers = ["make", "model", "variant", "model_year", "mileage_km", "price_dkk", "monthly_price_dkk", "fuel_type", "transmission", "body_type", "color", "status", "slug"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = vehicles.map((v) =>
    [v.make, v.model, v.variant, v.modelYear, v.mileageKm, v.priceDkk, v.monthlyPriceDkk, v.fuelType, v.transmission, v.bodyType, v.color, v.status, v.slug].map(escape).join(";")
  );
  return [headers.join(";"), ...rows].join("\n");
}

export function leadsToCsv(leads: AdminLead[]): string {
  const headers = ["reference", "status", "created_at", "registration_number", "mileage_km", "name", "phone", "email", "make", "model", "utm_source"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [l.reference, l.status, l.createdAt, l.registrationNumber, l.mileageKm, l.contact?.name, l.contact?.phone, l.contact?.email, l.vehicle?.make, l.vehicle?.model, ""].map(escape).join(";")
  );
  return [headers.join(";"), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Simpel CSV-import (semikolonsepareret, samme kolonner som eksporten). */
export function parseVehicleCsv(text: string): Array<Partial<VehicleFormValues>> {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(";").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"'));
    const get = (key: string) => cells[headers.indexOf(key)] ?? "";
    return {
      make: get("make"),
      model: get("model"),
      variant: get("variant"),
      modelYear: get("model_year"),
      mileageKm: get("mileage_km"),
      priceDkk: get("price_dkk"),
      monthlyPriceDkk: get("monthly_price_dkk"),
      fuelType: get("fuel_type"),
      transmission: get("transmission"),
      bodyType: get("body_type"),
      color: get("color"),
      status: get("status") || "draft",
      slug: get("slug"),
    };
  });
}
