import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Loader2, Send } from "lucide-react";
import { useInventory } from "@/features/vehicles/api";
import { estimateTradeInValue, valuationInputFromLookup } from "@/features/leads/valuation";
import type { ConsentStepInput, SellCarState } from "@/features/leads/schema";
import { formatPrice } from "@/lib/format";
import { useBrand } from "@/app/BrandProvider";

export function StepValuation({
  state,
  isSubmitting,
  submitError,
  onEstimate,
  onSubmit,
  onBack,
}: {
  state: SellCarState;
  isSubmitting: boolean;
  submitError: string | null;
  /** Kaldes med det beregnede skøn, så det kan gemmes på wizard-state og sendes med henvendelsen. */
  onEstimate: (estimate: SellCarState["estimate"]) => void;
  onSubmit: (consent: ConsentStepInput) => void;
  onBack: () => void;
}) {
  const brand = useBrand();
  const { data: stock } = useInventory();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleLabel = state.lookup
    ? [state.lookup.make, state.lookup.model, state.lookup.variant].filter(Boolean).join(" ")
    : state.manualVehicle
      ? [state.manualVehicle.make, state.manualVehicle.model, state.manualVehicle.variant].filter(Boolean).join(" ")
      : "din bil";

  const estimate = useMemo(() => {
    const input = valuationInputFromLookup(state.lookup, state.manualVehicle, state.plate?.mileageKm ?? 0, state.condition);
    const result = estimateTradeInValue(input, stock ?? []);
    const mapped: NonNullable<SellCarState["estimate"]> = {
      lowDkk: result.low,
      midDkk: result.mid,
      highDkk: result.high,
      sampleSize: result.sampleSize,
      basis: result.basis,
    };
    onEstimate(mapped);
    return mapped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lookup, state.manualVehicle, state.plate?.mileageKm, state.condition, stock]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processing) {
      setError("Du skal acceptere behandlingen af dine oplysninger for at sende henvendelsen");
      return;
    }
    setError(null);
    onSubmit({ processingConsent: true, marketingConsent: false, marketingChannels: [] });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-primary">Dit foreløbige skøn</h2>
        <p className="mt-1 text-sm text-brand-ink/70">
          Baseret på oplysningerne om {vehicleLabel}, kilometerstand og stand.
        </p>
      </div>

      <div className="rounded-2xl bg-brand-primary/5 p-6 text-center ring-1 ring-brand-primary/10">
        <p className="text-sm font-medium text-brand-ink/70">Vi vurderer, at din bil er værd</p>
        <p className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          {formatPrice(estimate.lowDkk)} – {formatPrice(estimate.highDkk)}
        </p>
        <p className="mt-1 text-sm text-brand-ink/60">Cirka {formatPrice(estimate.midDkk)} i gennemsnit</p>
      </div>

      <div className="flex gap-3 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
        <Info className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          Dette er et <strong>automatisk beregnet skøn</strong> ud fra et markedssnit for sammenlignelige biler samt
          de oplysninger, du selv har angivet. Det er <strong>ikke et bindende tilbud</strong>. Når du sender din
          henvendelse, gennemgår en af vores bilsælgere oplysningerne og vender tilbage til dig{" "}
          <strong>telefonisk eller på mail</strong> med et konkret, uforpligtende køberbud – typisk{" "}
          {brand.leadResponseTime}.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-brand-ink/10 bg-white p-5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={processing}
            onChange={(e) => setProcessing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-brand-ink/30"
            aria-describedby={error ? "valuation-consent-err" : undefined}
          />
          <span>
            Jeg accepterer, at {brand.name} behandler mine oplysninger for at kunne vurdere min bil og kontakte mig
            om min henvendelse.{" "}
            <Link to="/privatlivspolitik" target="_blank" className="underline">
              Læs privatlivspolitikken
            </Link>
            . *
          </span>
        </label>
        {error && <p id="valuation-consent-err" className="text-sm text-red-700">{error}</p>}
      </div>

      {submitError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{submitError}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-sm text-brand-ink/60 hover:text-brand-primary disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbage
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-brand-gradient px-6 py-3 font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60 motion-reduce:transform-none"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          Send og få det endelige bud
        </button>
      </div>
    </form>
  );
}
