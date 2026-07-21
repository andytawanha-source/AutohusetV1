import { ShieldCheck, Car, Umbrella } from "lucide-react";

/**
 * Samarbejdspartnere-strip under hero-sektionen på forsiden.
 *
 * Rigtige partnere (juli 2026): AutoConcept (bilgaranti/forsikring på brugte biler),
 * One2move Biludlejning (erstatningsbil/udlejning) og If Forsikring (bilforsikring).
 * Der linkes ud til partnernes egne sider i stedet for at hotlinke deres logofiler –
 * det undgår brud på deres billed-hosting og eventuelle rettighedsspørgsmål ved at
 * genbruge et varemærkebeskyttet logo uden en downloadet, godkendt fil. Har I fået
 * logofiler udleveret af partnerne, kan de lægges i /public/partners/ og sættes som
 * `logoSrc` herunder, så vises det rigtige logo i stedet for ikonet.
 */
const PARTNERS: Array<{
  name: string;
  tagline: string;
  href: string;
  icon: typeof ShieldCheck;
  logoSrc?: string;
}> = [
  {
    name: "AutoConcept",
    tagline: "Bilgaranti og forsikring på din brugte bil",
    href: "https://www.autoconcept.dk/home",
    icon: ShieldCheck,
  },
  {
    name: "One2move Biludlejning",
    tagline: "Erstatningsbil og biludlejning i hele Danmark",
    href: "https://one2movebiludlejning.dk/",
    icon: Car,
  },
  {
    name: "If Forsikring",
    tagline: "Bilforsikring til din nye bil",
    href: "https://www.if.dk/",
    icon: Umbrella,
  },
];

export function PartnerLogos() {
  return (
    <section className="border-b border-brand-ink/5 bg-white py-10" aria-label="Samarbejdspartnere">
      <div className="container">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-brand-ink/40">
          I samarbejde med
        </p>
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          {PARTNERS.map((partner) =>
            partner.logoSrc ? (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center px-3"
              >
                <img
                  src={partner.logoSrc}
                  alt={partner.name}
                  className="h-10 w-auto object-contain opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </a>
            ) : (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-64 items-center gap-3 rounded-lg border border-brand-ink/10 px-4 py-3 text-left transition-colors hover:border-brand-primary/40 hover:bg-brand-surface-warm/40"
              >
                <partner.icon className="h-7 w-7 shrink-0 text-brand-accent" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-brand-ink">{partner.name}</span>
                  <span className="block text-xs text-brand-ink/60">{partner.tagline}</span>
                </span>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}
