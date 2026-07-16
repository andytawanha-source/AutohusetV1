import { Seo } from "@/components/seo/Seo";

export default function FavoritesPage() {
  return (
    <div className="container py-16">
      <Seo title="Favoritter" index={false} />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Dine favoritter</h1>
      <p className="mt-4 text-brand-ink/70">Favoritsiden bygges i Fase 2.</p>
    </div>
  );
}
