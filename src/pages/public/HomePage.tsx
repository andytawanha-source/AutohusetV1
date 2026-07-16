import { Seo } from "@/components/seo/Seo";
import { useBrand } from "@/app/BrandProvider";

/** Udbygges i Fase 2 med hero-toggle, søgning, sektioner m.m. */
export default function HomePage() {
  const brand = useBrand();
  return (
    <div className="container py-16">
      <Seo />
      <h1 className="font-display text-4xl font-bold text-brand-primary">{brand.name}</h1>
      <p className="mt-4 max-w-xl text-lg text-brand-ink/70">
        Fundamentet er på plads. Forsiden bygges færdig i Fase 2 med hero, søgning og alle sektioner.
      </p>
    </div>
  );
}
