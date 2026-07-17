import { Clock, Lock, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { SellCarWizard } from "@/components/sell/SellCarWizard";
import { useBrand } from "@/app/BrandProvider";

export default function SellCarPage() {
  const brand = useBrand();
  return (
    <div className="container py-10 lg:py-14">
      <Seo
        title="Sælg din bil"
        description={`Få et uforpligtende tilbud på din bil hos ${brand.name}. Indtast din nummerplade og modtag svar ${brand.leadResponseTime}.`}
      />
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-brand-primary lg:text-4xl">Sælg din bil</h1>
        <p className="mt-2 text-brand-ink/70">
          Få et uforpligtende tilbud på under 2 minutter – uden annoncer, fremvisninger og usikre købere.
        </p>
      </div>

      <SellCarWizard />

      <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-brand-ink/60">
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-accent" aria-hidden /> 100 % uforpligtende</li>
        <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-accent" aria-hidden /> Svar {brand.leadResponseTime}</li>
        <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-brand-accent" aria-hidden /> Dine oplysninger behandles fortroligt</li>
      </ul>
    </div>
  );
}
