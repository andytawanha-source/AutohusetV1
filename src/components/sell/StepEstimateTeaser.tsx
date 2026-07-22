import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ValuationEstimate } from "@/features/leads/valuation";

/**
 * Viser et hurtigt, bredt skøn ("cirka det, tilsvarende biler er værd") lige efter
 * Stand-trinnet – FØR vi beder om kontaktoplysninger. Formålet er udelukkende at sætte
 * forventninger tidligt, så kunden ikke føler sig taget useriøst af et overraskende tal
 * til sidst. Selve leadet indsendes stadig først når kontakt+samtykke er givet (se
 * TradeInModal.tsx) – denne skærm sender intet og gemmer intet.
 */
export function StepEstimateTeaser({
  estimate,
  onContinue,
  onBack,
}: {
  estimate: ValuationEstimate;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-primary">Dit foreløbige skøn</h2>
        <p className="mt-1 text-sm text-brand-ink/70">
          Baseret på et hurtigt gennemsyn af tilsvarende biler og de oplysninger, du har angivet indtil nu.
        </p>
      </div>

      <div className="rounded-2xl bg-brand-primary/5 p-6 text-center ring-1 ring-brand-primary/10">
        <p className="text-sm font-medium text-brand-ink/70">Tilsvarende biler er typisk værd</p>
        <p className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          {formatPrice(estimate.low)} – {formatPrice(estimate.high)}
        </p>
        <p className="mt-1 text-sm text-brand-ink/60">Cirka {formatPrice(estimate.mid)} i gennemsnit</p>
      </div>

      <div className="flex gap-3 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
        <Info className="h-5 w-5 shrink-0" aria-hidden />
        <p>
          Dette er et <strong>meget bredt, automatisk skøn</strong> – det bliver mere præcist, når du har udfyldt
          dine kontaktoplysninger, og en af vores bilsælgere har gennemgået din bil. Det er{" "}
          <strong>ikke et bindende tilbud</strong>.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-brand-ink/60 hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbage
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-md bg-brand-gradient px-6 py-3 font-bold text-white transition-transform hover:scale-[1.02] motion-reduce:transform-none"
        >
          Få det endelige bud <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
