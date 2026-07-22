import { next } from "@vercel/edge";

/**
 * Simpel adgangskodelås for HELE sitet (inkl. adminpanelet), mens platformen
 * stadig er i test/udkast-fase. Beskytter via HTTP Basic Auth på Vercels
 * Edge-lag – browseren viser en indbygget login-boks, før noget som helst
 * af siden (HTML, JS, billeder) sendes til klienten.
 *
 * Adgangskoden sættes IKKE i koden, men som miljøvariabler i Vercel:
 *   SITE_AUTH_USER      (valgfri, default "autohuset")
 *   SITE_AUTH_PASSWORD  (påkrævet for at låsen er aktiv)
 *
 * Er SITE_AUTH_PASSWORD ikke sat (fx lokalt), er låsen automatisk deaktiveret,
 * så almindelig udvikling ikke påvirkes.
 *
 * Fjernes/deaktiveres nemt igen: slet denne fil, eller ryd
 * SITE_AUTH_PASSWORD i Vercel, når sitet skal være offentligt tilgængeligt.
 */
export const config = {
  matcher: "/((?!favicon|apple-touch-icon|icons/|site.webmanifest).*)",
};

export default function middleware(request: Request) {
  const password = process.env.SITE_AUTH_PASSWORD;
  if (!password) return next();

  const user = process.env.SITE_AUTH_USER || "autohuset";
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(6));
      const separatorIndex = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separatorIndex);
      const suppliedPass = decoded.slice(separatorIndex + 1);
      if (suppliedUser === user && suppliedPass === password) {
        return next();
      }
    } catch {
      // Ugyldig Base64 -> falder igennem til 401 herunder
    }
  }

  return new Response("Adgang kræver login.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Autohuset – under udvikling"' },
  });
}
