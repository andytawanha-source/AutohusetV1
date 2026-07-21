import { Car, Truck, Bus, CarFront } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { useBrand } from "@/app/BrandProvider";

const ONE2MOVE_URL = "https://one2movebiludlejning.dk/";

/**
 * PLACEHOLDER-DATA: Biludlejningen sker gennem samarbejdspartneren One2move –
 * vi har ikke selv et lejebillager. Nedenstående er tilfældige eksempelbiler,
 * der viser typen af biler man kan leje. Erstat med rigtige priser/billeder,
 * hvis One2move leverer et feed, eller fjern og henvis udelukkende til deres side.
 */
const RENTAL_CARS: Array<{ name: string; category: string; priceFrom: number; icon: typeof Car }> = [
  { name: "VW Polo eller lignende", category: "Personbil, lille", priceFrom: 349, icon: Car },
  { name: "VW Golf eller lignende", category: "Personbil, mellemklasse", priceFrom: 449, icon: CarFront },
  { name: "VW Caddy eller lignende", category: "Varevogn", priceFrom: 549, icon: Truck },
  { name: "Ford Transit eller lignende", category: "Flyttebil", priceFrom: 649, icon: Truck },
  { name: "Mercedes Vito eller lignende", category: "Minibus, 9 personer", priceFrom: 899, icon: Bus },
  { name: "VW Passat stationcar", category: "Stationcar", priceFrom: 499, icon: CarFront },
];

export default function RentalPage() {
  const brand = useBrand();
  return (
    <div className="container py-10 lg:py-14">
      <Seo
        title="Biludlejning"
        description={`Lej en bil hos ${brand.name} gennem vores samarbejdspartner One2move Biludlejning.`}
      />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-brand-primary lg:text-4xl">Biludlejning</h1>
        <p className="mt-3 leading-relaxed text-brand-ink/70">
          Har du brug for en bil i en periode – til en flyttedag, mens din egen er til service, eller bare til en
          tur? Vi tilbyder biludlejning i samarbejde med{" "}
          <a href={ONE2MOVE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            One2move Biludlejning
          </a>
          . Book direkte hos One2move, eller kontakt os, så hjælper vi dig videre.
        </p>
        <p className="mt-2 text-xs text-brand-ink/40">
          Eksempler herunder er vejledende. Se opdaterede priser og ledige biler hos One2move.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {RENTAL_CARS.map((car) => (
          <div
            key={car.name}
            className="flex flex-col items-center rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-brand-ink/5"
          >
            <div className="flex h-20 w-full items-center justify-center rounded-lg bg-brand-surface-warm">
              <car.icon className="h-9 w-9 text-brand-accent" aria-hidden />
            </div>
            <h2 className="mt-3 font-semibold text-brand-ink">{car.name}</h2>
            <p className="text-sm text-brand-ink/60">{car.category}</p>
            <p className="mt-2 font-display text-lg font-bold text-brand-primary">
              Fra {car.priceFrom} kr./dag
            </p>
            <a
              href={ONE2MOVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Se ledige biler hos One2move
            </a>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-xl bg-brand-surface-warm/60 p-6 text-center text-sm text-brand-ink/70">
        <p>
          One2move Biludlejning har over 80 afdelinger i hele Danmark – herunder tæt på os. Alle priser, vilkår og
          booking foregår hos One2move, som også står for udlevering og aflevering af lejebilen.
        </p>
      </div>
    </div>
  );
}
