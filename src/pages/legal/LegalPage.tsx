import { Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { LEGAL_DOCS } from "./legalContent";
import { useBrand } from "@/app/BrandProvider";

/**
 * Juridiske sider. Indholdet er UDKAST med placeholders og markeres tydeligt,
 * indtil teksterne er godkendt (spec pkt. 18/25). I produktion kan indholdet
 * hentes fra legal_documents-tabellen og overstyre disse skabeloner.
 */
export default function LegalPage() {
  const { legalSlug } = useParams();
  const brand = useBrand();
  const doc = legalSlug ? LEGAL_DOCS[legalSlug] : undefined;

  if (!doc) return <Navigate to="/404" replace />;

  return (
    <div className="container max-w-3xl py-12 lg:py-16">
      <Seo title={doc.title} />
      <p className="mb-4 inline-block rounded-md bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
        UDKAST ({doc.version}) – skal gennemgås og godkendes juridisk før lancering
      </p>
      <h1 className="font-display text-3xl font-bold text-brand-primary">{doc.title}</h1>
      <p className="mt-1 text-sm text-brand-ink/50">{brand.name}</p>

      <div className="mt-8 space-y-6">
        {doc.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="mb-2 font-display text-lg font-bold text-brand-primary">{section.heading}</h2>
            )}
            <p className="leading-relaxed text-brand-ink/80">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
