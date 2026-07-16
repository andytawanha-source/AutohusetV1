import { Seo } from "@/components/seo/Seo";

/** Udbygges i Fase 2 med filtre, sortering og URL-synk. */
export default function VehicleListPage() {
  return (
    <div className="container py-16">
      <Seo title="Biler til salg" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Biler til salg</h1>
      <p className="mt-4 text-brand-ink/70">Biloversigten bygges i Fase 2.</p>
    </div>
  );
}
