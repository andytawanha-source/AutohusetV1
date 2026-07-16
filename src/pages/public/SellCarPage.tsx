import { Seo } from "@/components/seo/Seo";

/** 6-trins salgsvurdering bygges i Fase 3. */
export default function SellCarPage() {
  return (
    <div className="container py-16">
      <Seo title="Sælg din bil" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Sælg din bil</h1>
      <p className="mt-4 text-brand-ink/70">Den trindelte salgsvurdering bygges i Fase 3.</p>
    </div>
  );
}
