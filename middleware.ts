import { next } from "@vercel/edge";

/**
 * Simpel adgangskodelås for HELE sitet (inkl. adminpanelet), mens platformen
 * stadig er i test/udkast-fase. Viser en synlig login-formular på siden selv
 * (ikke browserens indbyggede Basic Auth-boks, som ikke altid vises korrekt
 * i alle browsere/apps) og sætter en cookie ved korrekt adgangskode.
 *
 * Adgangskoden sættes IKKE i koden, men som miljøvariabel i Vercel:
 *   SITE_AUTH_PASSWORD  (påkrævet for at låsen er aktiv)
 *
 * Er SITE_AUTH_PASSWORD ikke sat (fx lokalt), er låsen automatisk deaktiveret,
 * så almindelig udvikling ikke påvirkes.
 *
 * Fjernes/deaktiveres nemt igen: slet denne fil, eller ryd
 * SITE_AUTH_PASSWORD i Vercel, når sitet skal være offentligt tilgængeligt.
 */
export const config = {
  // Ekskluderer også /assets/ (de hashede build-JS/CSS-filer) – de skal altid kunne
  // hentes uden om login-formularen, ellers risikerer en session, hvor cookien af en
  // eller anden grund ikke følger med på asset-anmodningen, at ende med en hvid/ødelagt
  // side i stedet for blot at vise login-siden på selve dokumentet.
  matcher: "/((?!favicon|apple-touch-icon|icons/|site.webmanifest|assets/).*)",
};

const COOKIE_NAME = "site_auth";

function loginPage(error?: string): string {
  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Log ind</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: #0f1b3d;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    padding: 1rem;
  }
  form {
    background: #ffffff;
    padding: 2rem;
    border-radius: 16px;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  }
  h1 {
    font-size: 1.05rem;
    margin: 0 0 0.35rem;
    color: #111827;
  }
  p.sub {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0 0 1.25rem;
  }
  p.error {
    color: #b91c1c;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
    font-weight: 600;
  }
  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.35rem;
  }
  input {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  input:focus {
    outline: 2px solid #2038b0;
    border-color: #2038b0;
  }
  button {
    width: 100%;
    padding: 0.75rem;
    background: #2038b0;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
  }
  button:hover {
    opacity: 0.9;
  }
</style>
</head>
<body>
  <form method="POST">
    <h1>Denne side er under udvikling</h1>
    <p class="sub">Indtast adgangskoden for at fortsætte.</p>
    ${error ? `<p class="error">${error}</p>` : ""}
    <label for="password">Adgangskode</label>
    <input type="password" id="password" name="password" autofocus required autocomplete="current-password" />
    <button type="submit">Log ind</button>
  </form>
</body>
</html>`;
}

export default async function middleware(request: Request) {
  const password = process.env.SITE_AUTH_PASSWORD;
  if (!password) return next();

  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasValidCookie = cookieHeader.split(";").some((entry) => {
    const [key, ...rest] = entry.trim().split("=");
    return key === COOKIE_NAME && rest.join("=") === password;
  });
  if (hasValidCookie) return next();

  if (request.method === "POST") {
    let submitted: string | null = null;
    try {
      const form = await request.formData();
      submitted = String(form.get("password") ?? "");
    } catch {
      submitted = null;
    }

    if (submitted === password) {
      const url = new URL(request.url);
      return new Response(null, {
        status: 303,
        headers: {
          Location: url.pathname + url.search,
          "Set-Cookie": `${COOKIE_NAME}=${password}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }

    return new Response(loginPage("Forkert adgangskode – prøv igen."), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return new Response(loginPage(), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
