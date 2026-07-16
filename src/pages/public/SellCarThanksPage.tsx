import { useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

export default function SellCarThanksPage() {
  const { reference } = useParams();
  return (
    <div className="container py-16">
      <Seo title="Tak for din henvendelse" index={false} />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Tak for din henvendelse</h1>
      <p className="mt-4 text-brand-ink/70">Reference: {reference}. Siden færdiggøres i Fase 3.</p>
    </div>
  );
}
