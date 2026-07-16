import { useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

/** Udbygges i Fase 2 med galleri, nøgletal og CTA'er. */
export default function VehicleDetailPage() {
  const { slug } = useParams();
  return (
    <div className="container py-16">
      <Seo title="Bildetaljer" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Bildetaljer</h1>
      <p className="mt-4 text-brand-ink/70">Detaljeside for “{slug}” bygges i Fase 2.</p>
    </div>
  );
}
