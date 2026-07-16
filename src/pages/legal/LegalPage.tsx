import { Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

/** Juridiske sider – indhold (UDKAST) leveres i Fase 5 fra legal_documents. */
const LEGAL_SLUGS: Record<string, string> = {
  privatlivspolitik: "Privatlivspolitik",
  cookiepolitik: "Cookiepolitik",
  handelsbetingelser: "Handelsbetingelser",
  "vilkaar-bilvurdering": "Vilkår for bilvurdering",
  "juridiske-forbehold": "Juridiske forbehold",
  finansieringsforbehold: "Finansieringsforbehold",
  klagevejledning: "Klagevejledning",
};

export default function LegalPage() {
  const { legalSlug } = useParams();
  const title = legalSlug ? LEGAL_SLUGS[legalSlug] : undefined;

  if (!title) return <Navigate to="/404" replace />;

  return (
    <div className="container max-w-3xl py-16">
      <Seo title={title} />
      <p className="mb-4 inline-block rounded-md bg-brand-accent/20 px-3 py-1 text-sm font-semibold text-brand-primary">
        UDKAST – afventer juridisk godkendelse
      </p>
      <h1 className="font-display text-3xl font-bold text-brand-primary">{title}</h1>
      <p className="mt-4 text-brand-ink/70">Indholdet leveres som juridisk udkast i Fase 5.</p>
    </div>
  );
}
