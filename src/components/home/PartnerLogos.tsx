/**
 * Samarbejdspartnere-strip under hero-sektionen på forsiden.
 *
 * PLACEHOLDER: Udfyld listen herunder med jeres rigtige partnere. Har I et logo,
 * så læg billedfilen i /public (fx /public/partners/autotjek.svg) og sæt `logoSrc`
 * til stien, fx "/partners/autotjek.svg" – så vises logoet i stedet for tekstboksen.
 * Uden `logoSrc` vises blot en tydelig placeholder-boks med navnet.
 */
const PARTNERS: Array<{ name: string; logoSrc?: string }> = [
  { name: "[PARTNER 1 – fx 100% Autotjek]" },
  { name: "[PARTNER 2 – fx AutoBranchen Danmark]" },
  { name: "[PARTNER 3 – fx Fragus Group]" },
  { name: "[PARTNER 4 – fx Santander]" },
];

export function PartnerLogos() {
  return (
    <section className="border-b border-brand-ink/5 bg-white py-10" aria-label="Samarbejdspartnere">
      <div className="container">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-brand-ink/40">
          I samarbejde med
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {PARTNERS.map((partner) =>
            partner.logoSrc ? (
              <img
                key={partner.name}
                src={partner.logoSrc}
                alt={partner.name}
                className="h-10 w-auto object-contain opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <div
                key={partner.name}
                className="flex h-14 w-44 items-center justify-center rounded-md border-2 border-dashed border-brand-ink/15 px-3 text-center text-xs text-brand-ink/40"
              >
                {partner.name}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
