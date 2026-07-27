import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { useBrand } from "@/app/BrandProvider";
import { useRentalInventory } from "@/features/vehicles/api";

const ONE2MOVE_URL = "https://one2movebiludlejning.dk/";

export default function RentalPage() {
  const brand = useBrand();
  const { data: cars, isLoading } = useRentalInventory();
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
          Se opdaterede priser og ledige biler hos One2move.
        </p>
      </div>

      {isLoading && <p className="mt-10 text-center text-sm text-brand-ink/50">Henter biler …</p>}

      {!isLoading && (!cars || cars.length === 0) && (
        <p className="mt-10 text-center text-sm text-brand-ink/50">
          Ingen lejebiler fundet lige nu – se det fulde udvalg direkte hos{" "}
          <a href={ONE2MOVE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            One2move
          </a>
          .
        </p>
      )}

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cars?.map((car) => (
          <Link
            key={car.id}
            to={`/biludlejning/${car.slug}`}
            className="group flex flex-col items-center rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-brand-ink/5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-20 w-full items-center justify-center rounded-lg bg-brand-surface-warm">
              <Car className="h-9 w-9 text-brand-accent" aria-hidden />
            </div>
            <h2 className="mt-3 font-semibold text-brand-ink group-hover:text-brand-primary">
              {car.make} {car.model}
            </h2>
            <p className="text-sm text-brand-ink/60">{car.bodyType}</p>
            <p className="mt-2 font-display text-lg font-bold text-brand-primary">
              {car.rentalDetails?.pricePerDayDkk != null
                ? `Fra ${car.rentalDetails.pricePerDayDkk.toLocaleString("da-DK")} kr./dag`
                : "Pris hos One2move"}
            </p>
            <span className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity group-hover:opacity-90">
              Læs mere
            </span>
          </Link>
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
