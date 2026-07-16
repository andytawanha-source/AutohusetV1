import { Seo } from "@/components/seo/Seo";
import { useBrand } from "@/app/BrandProvider";

export default function AboutPage() {
  const brand = useBrand();
  return (
    <div className="container py-16">
      <Seo title="Om os" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Om {brand.name}</h1>
      <p className="mt-4 text-brand-ink/70">Om os-siden bygges i Fase 2.</p>
    </div>
  );
}
