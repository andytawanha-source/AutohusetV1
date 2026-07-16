import { Seo } from "@/components/seo/Seo";

export default function SoldVehiclesPage() {
  return (
    <div className="container py-16">
      <Seo title="Solgte biler" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Solgte biler</h1>
      <p className="mt-4 text-brand-ink/70">Arkivet over solgte biler bygges i Fase 2.</p>
    </div>
  );
}
