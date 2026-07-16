import { Seo } from "@/components/seo/Seo";

/** Consent-styring implementeres i Fase 5 – denne side åbner præferencedialogen. */
export default function CookieSettingsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <Seo title="Cookieindstillinger" />
      <h1 className="font-display text-3xl font-bold text-brand-primary">Cookieindstillinger</h1>
      <p className="mt-4 text-brand-ink/70">
        Her kan du til enhver tid ændre dit cookiesamtykke. Consent-styringen implementeres i Fase 5.
      </p>
    </div>
  );
}
