import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Eye, Loader2, Save, Upload } from "lucide-react";
import { useAdminVehicles, useSaveVehicle, type VehicleFormValues } from "../api";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAdminAuth } from "../auth";
import type { AdminVehicle } from "../types";

const inputCls = "w-full rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm";
const BADGES = ["Nyhed", "Populær", "Elbil"];

const EMPTY: VehicleFormValues = {
  make: "", model: "", variant: "", modelYear: "", firstRegistration: "", mileageKm: "",
  priceDkk: "", monthlyPriceDkk: "", fuelType: "", transmission: "", bodyType: "", color: "",
  doors: "", seats: "", powerHp: "", engine: "", batteryKwh: "", rangeKm: "", consumption: "",
  taxPeriodDkk: "", registrationNumber: "", showRegistrationNumber: false, vin: "",
  description: "", internalNotes: "", equipment: "", badges: [], isFeatured: false,
  seoTitle: "", seoDescription: "", slug: "", status: "draft", publishAt: "",
};

function toForm(v: AdminVehicle): VehicleFormValues {
  const s = (x: unknown) => (x === null || x === undefined ? "" : String(x));
  return {
    id: v.id, make: v.make, model: v.model, variant: s(v.variant), modelYear: s(v.modelYear),
    firstRegistration: s(v.firstRegistration), mileageKm: s(v.mileageKm), priceDkk: s(v.priceDkk),
    monthlyPriceDkk: s(v.monthlyPriceDkk), fuelType: s(v.fuelType), transmission: s(v.transmission),
    bodyType: s(v.bodyType), color: s(v.color), doors: s(v.doors), seats: s(v.seats),
    powerHp: s(v.powerHp), engine: s(v.engine), batteryKwh: s(v.batteryKwh), rangeKm: s(v.rangeKm),
    consumption: s(v.consumption), taxPeriodDkk: s(v.taxPeriodDkk),
    registrationNumber: s(v.registrationNumber), showRegistrationNumber: v.showRegistrationNumber,
    vin: s(v.vin), description: s(v.description), internalNotes: s(v.internalNotes),
    equipment: v.equipment.join("\n"), badges: v.badges, isFeatured: v.isFeatured,
    seoTitle: s(v.seoTitle), seoDescription: s(v.seoDescription), slug: v.slug,
    status: v.status, publishAt: v.publishAt ? v.publishAt.slice(0, 16) : "",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

export default function AdminVehicleFormPage() {
  const { id } = useParams();
  const isNew = !id || id === "ny";
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const { data: vehicles } = useAdminVehicles();
  const saveMutation = useSaveVehicle();
  const [form, setForm] = useState<VehicleFormValues>(EMPTY);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const existing = isNew ? undefined : vehicles?.find((v) => v.id === id);

  useEffect(() => {
    if (existing && loadedId !== existing.id) {
      setForm(toForm(existing));
      setLoadedId(existing.id);
    }
  }, [existing, loadedId]);

  const set = <K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.make || !form.model) {
      setMessage("Mærke og model er obligatoriske.");
      return;
    }
    try {
      await saveMutation.mutateAsync(form);
      setMessage("Bilen er gemt.");
      if (isNew) navigate("/admin/biler");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Kunne ikke gemme.");
    }
  };

  const duplicate = async () => {
    await saveMutation.mutateAsync({ ...form, id: undefined, slug: "", status: "draft", registrationNumber: "", vin: "" });
    setMessage("Bilen er duplikeret som kladde.");
  };

  const uploadImages = async (files: FileList) => {
    if (!isSupabaseConfigured) {
      setMessage("DEMO-MODE: Billedupload kræver et konfigureret Supabase-projekt.");
      return;
    }
    if (!existing) {
      setMessage("Gem bilen først, og upload derefter billeder.");
      return;
    }
    setUploading(true);
    try {
      const supabase = getSupabase();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${user!.organizationId}/${existing.id}/${Date.now()}-${i}.${file.name.split(".").pop()}`;
        const { error: upErr } = await supabase.storage.from("vehicle-images").upload(path, file);
        if (upErr) throw new Error(upErr.message);
        const { error: dbErr } = await supabase.from("vehicle_images").insert({
          organization_id: user!.organizationId,
          vehicle_id: existing.id,
          storage_path: path,
          alt_text: `${form.make} ${form.model}`,
          sort_order: existing.images.length + i,
          is_primary: existing.images.length === 0 && i === 0,
        });
        if (dbErr) throw new Error(dbErr.message);
      }
      setMessage(`${files.length} billeder uploadet.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload fejlede.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/biler" className="rounded-md p-2 hover:bg-brand-ink/5" aria-label="Tilbage til biler">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-primary">
            {isNew ? "Opret bil" : `${form.make} ${form.model}`}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <>
              <a href={`/biler/${form.slug}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm hover:bg-brand-ink/5">
                <Eye className="h-4 w-4" aria-hidden /> Forhåndsvis
              </a>
              <button type="button" onClick={duplicate}
                className="inline-flex items-center gap-1.5 rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm hover:bg-brand-ink/5">
                <Copy className="h-4 w-4" aria-hidden /> Duplikér
              </button>
            </>
          )}
          <button type="submit" disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            Gem
          </button>
        </div>
      </div>

      {message && <p className="rounded-md bg-brand-primary/5 p-3 text-sm" role="status">{message}</p>}

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-ink/5">
        <h2 className="mb-4 font-display text-lg font-bold text-brand-primary">Grunddata</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Mærke *"><input className={inputCls} value={form.make} onChange={(e) => set("make", e.target.value)} required /></Field>
          <Field label="Model *"><input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} required /></Field>
          <Field label="Variant"><input className={inputCls} value={form.variant} onChange={(e) => set("variant", e.target.value)} /></Field>
          <Field label="Årgang"><input type="number" className={inputCls} value={form.modelYear} onChange={(e) => set("modelYear", e.target.value)} /></Field>
          <Field label="1. registrering"><input type="date" className={inputCls} value={form.firstRegistration} onChange={(e) => set("firstRegistration", e.target.value)} /></Field>
          <Field label="Kilometerstand"><input type="number" className={inputCls} value={form.mileageKm} onChange={(e) => set("mileageKm", e.target.value)} /></Field>
          <Field label="Kontantpris (kr.)"><input type="number" className={inputCls} value={form.priceDkk} onChange={(e) => set("priceDkk", e.target.value)} /></Field>
          <Field label="Månedlig ydelse (kr.)"><input type="number" className={inputCls} value={form.monthlyPriceDkk} onChange={(e) => set("monthlyPriceDkk", e.target.value)} /></Field>
          <Field label="Drivmiddel">
            <select className={inputCls} value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)}>
              <option value="">Vælg…</option>
              <option value="benzin">Benzin</option><option value="diesel">Diesel</option>
              <option value="el">El</option><option value="hybrid">Hybrid</option>
              <option value="plugin_hybrid">Plugin-hybrid</option><option value="andet">Andet</option>
            </select>
          </Field>
          <Field label="Gearkasse">
            <select className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)}>
              <option value="">Vælg…</option><option value="manuel">Manuel</option><option value="automatisk">Automatisk</option>
            </select>
          </Field>
          <Field label="Karrosseri"><input className={inputCls} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)} placeholder="fx SUV" /></Field>
          <Field label="Farve"><input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} /></Field>
          <Field label="Døre"><input type="number" className={inputCls} value={form.doors} onChange={(e) => set("doors", e.target.value)} /></Field>
          <Field label="Sæder"><input type="number" className={inputCls} value={form.seats} onChange={(e) => set("seats", e.target.value)} /></Field>
          <Field label="Effekt (hk)"><input type="number" className={inputCls} value={form.powerHp} onChange={(e) => set("powerHp", e.target.value)} /></Field>
          <Field label="Motor"><input className={inputCls} value={form.engine} onChange={(e) => set("engine", e.target.value)} /></Field>
          <Field label="Batteri (kWh)"><input type="number" step="0.1" className={inputCls} value={form.batteryKwh} onChange={(e) => set("batteryKwh", e.target.value)} /></Field>
          <Field label="Rækkevidde (km)"><input type="number" className={inputCls} value={form.rangeKm} onChange={(e) => set("rangeKm", e.target.value)} /></Field>
          <Field label="Forbrug"><input className={inputCls} value={form.consumption} onChange={(e) => set("consumption", e.target.value)} placeholder="fx 18,5 km/l" /></Field>
          <Field label="Halvårlig afgift (kr.)"><input type="number" className={inputCls} value={form.taxPeriodDkk} onChange={(e) => set("taxPeriodDkk", e.target.value)} /></Field>
          <Field label="Registreringsnummer"><input className={inputCls} value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())} /></Field>
          <Field label="Stelnummer (privat)"><input className={inputCls} value={form.vin} onChange={(e) => set("vin", e.target.value)} /></Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.showRegistrationNumber} onChange={(e) => set("showRegistrationNumber", e.target.checked)} className="h-4 w-4 rounded" />
          Vis registreringsnummer offentligt på annoncen
        </label>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-ink/5">
        <h2 className="mb-4 font-display text-lg font-bold text-brand-primary">Indhold</h2>
        <div className="space-y-4">
          <Field label="Beskrivelse">
            <textarea rows={5} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Udstyr (ét punkt pr. linje)">
            <textarea rows={5} className={inputCls} value={form.equipment} onChange={(e) => set("equipment", e.target.value)} />
          </Field>
          <Field label="Interne noter (vises aldrig offentligt)">
            <textarea rows={2} className={inputCls} value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} />
          </Field>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Badges</legend>
            <div className="flex gap-4">
              {BADGES.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 rounded" checked={form.badges.includes(b)}
                    onChange={(e) => set("badges", e.target.checked ? [...form.badges, b] : form.badges.filter((x) => x !== b))} />
                  {b}
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 rounded" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
                Fremhævet bil
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-ink/5">
        <h2 className="mb-4 font-display text-lg font-bold text-brand-primary">Billeder</h2>
        {existing && existing.images.length > 0 && (
          <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {existing.images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-md ring-1 ring-brand-ink/10">
                <img src={img.url} alt={img.altText} className="aspect-[4/3] w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-brand-ink/15 bg-white px-4 py-2 text-sm hover:bg-brand-ink/5">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
          Upload billeder
          <input type="file" accept="image/*" multiple className="sr-only"
            onChange={(e) => e.target.files && void uploadImages(e.target.files)} />
        </label>
        {!isSupabaseConfigured && (
          <p className="mt-2 text-xs text-amber-700">DEMO-MODE: Billedupload kræver et konfigureret Supabase-projekt.</p>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-ink/5">
        <h2 className="mb-4 font-display text-lg font-bold text-brand-primary">SEO og status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO-titel (autogenereres hvis tom)"><input className={inputCls} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
          <Field label="URL-slug (autogenereres hvis tom)"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="SEO-beskrivelse (autogenereres hvis tom)">
              <textarea rows={2} className={inputCls} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Kladde</option>
              <option value="scheduled">Planlagt publicering</option>
              <option value="published">Publiceret</option>
              <option value="reserved">Reserveret</option>
              <option value="sold">Solgt</option>
              <option value="archived">Arkiveret</option>
            </select>
          </Field>
          {form.status === "scheduled" && (
            <Field label="Publicér tidligst">
              <input type="datetime-local" className={inputCls} value={form.publishAt} onChange={(e) => set("publishAt", e.target.value)} />
            </Field>
          )}
        </div>
      </section>
    </form>
  );
}
