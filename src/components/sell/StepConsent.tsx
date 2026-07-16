import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { ConsentStepInput, SellCarState } from "@/features/leads/schema";
import { formatMileage } from "@/lib/format";
import { useBrand } from "@/app/BrandProvider";
import { PHOTO_CATEGORIES } from "@/features/leads/schema";

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <dt className="text-brand-ink/60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

const TIMELINE_LABELS: Record<string, string> = {
  hurtigst_muligt: "Hurtigst muligt",
  inden_for_en_maaned: "Inden for en måned",
  undersoeger_pris: "Undersøger prisen",
};

export function StepConsent({
  state,
  isSubmitting,
  submitError,
  onSubmit,
  onBack,
}: {
  state: SellCarState;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (consent: ConsentStepInput) => void;
  onBack: () => void;
}) {
  const brand = useBrand();
  const [processing, setProcessing] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [channels, setChannels] = useState<Array<"email" | "sms">>([]);
  const [error, setError] = useState<string | null>(null);

  const vehicle = state.lookup ?? state.manualVehicle;
  const vehicleName = vehicle
    ? [vehicle.make, vehicle.model, "variant" in vehicle ? vehicle.variant : undefined].filter(Boolean).join(" ")
    : "—";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processing) {
      setError("Du skal acceptere behandlingen af dine oplysninger for at sende henvendelsen");
      return;
    }
    setError(null);
    onSubmit({
      processingConsent: true,
      marketingConsent: marketing,
      marketingChannels: marketing ? channels : [],
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-primary">Gennemgå og send</h2>
        <p className="mt-1 text-sm text-brand-ink/70">Tjek, at oplysningerne er korrekte, før du sender.</p>
      </div>

      <dl className="space-y-1 rounded-xl bg-brand-surface-warm/40 p-5">
        <SummaryRow label="Nummerplade" value={state.plate?.registrationNumber} />
        <SummaryRow label="Kilometerstand" value={state.plate ? formatMileage(state.plate.mileageKm) : null} />
        <SummaryRow label="Bil" value={vehicleName} />
        <SummaryRow label="Kørende" value={state.condition?.isDrivable === "ja" ? "Ja" : "Nej"} />
        <SummaryRow label="Restgæld/finansiering" value={state.condition?.hasFinance === "ja" ? "Ja" : "Nej"} />
        <SummaryRow label="Ønsket salg" value={state.condition ? TIMELINE_LABELS[state.condition.saleTimeline] : null} />
        <SummaryRow
          label="Billeder"
          value={
            state.photos.length
              ? `${state.photos.length} stk. (${[...new Set(state.photos.map((p) => PHOTO_CATEGORIES.find((c) => c.key === p.category)?.label))].join(", ")})`
              : "Ingen"
          }
        />
        <SummaryRow label="Navn" value={state.contact?.name} />
        <SummaryRow label="Telefon" value={state.contact?.phone} />
        <SummaryRow label="E-mail" value={state.contact?.email} />
        <SummaryRow label="Postnummer" value={state.contact?.postalCode} />
      </dl>

      <div className="space-y-4 rounded-xl border border-brand-ink/10 bg-white p-5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={processing}
            onChange={(e) => setProcessing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-brand-ink/30"
            aria-describedby={error ? "consent-err" : undefined}
          />
          <span>
            Jeg accepterer, at {brand.name} behandler mine oplysninger for at kunne vurdere min bil og
            kontakte mig om min henvendelse.{" "}
            <Link to="/privatlivspolitik" target="_blank" className="underline">
              Læs privatlivspolitikken
            </Link>
            . *
          </span>
        </label>
        {error && <p id="consent-err" className="text-sm text-red-700">{error}</p>}

        <hr className="border-brand-ink/10" />

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-brand-ink/30"
          />
          <span>
            <span className="font-medium">Valgfrit:</span> Ja tak, jeg ønsker også at modtage relevante
            tilbud og nyheder fra {brand.name}. Dette er ikke et krav for at få vurderet min bil, og jeg
            kan altid trække mit samtykke tilbage.
          </span>
        </label>

        {marketing && (
          <fieldset className="ml-7 animate-fade-up">
            <legend className="mb-1.5 text-sm text-brand-ink/70">Via hvilke kanaler?</legend>
            <div className="flex gap-4">
              {(["email", "sms"] as const).map((channel) => (
                <label key={channel} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={(e) =>
                      setChannels((prev) =>
                        e.target.checked ? [...prev, channel] : prev.filter((c) => c !== channel)
                      )
                    }
                    className="h-4 w-4 rounded border-brand-ink/30"
                  />
                  {channel === "email" ? "E-mail" : "SMS"}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      {submitError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{submitError}</p>}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-sm text-brand-ink/60 hover:text-brand-primary disabled:opacity-50">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbage
        </button>
        <button type="submit" disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 font-bold text-brand-primary transition-transform hover:scale-[1.02] disabled:opacity-60 motion-reduce:transform-none">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          Send min henvendelse
        </button>
      </div>
    </form>
  );
}
