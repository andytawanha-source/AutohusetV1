import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Fuel, Settings2, Users } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { useBrand } from "@/app/BrandProvider";
import { getRentalCarBySlug } from "@/features/rentals/rentalData";

const ONE2MOVE_URL = "https://one2movebiludlejning.dk/";

export default function RentalCarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const brand = useBrand();
  const car = slug ? getRentalCarBySlug(slug) : undefined;

  if (!car) return <Navigate to="/biludlejning" replace />;

  return (
    <div className="container py-10 lg:py-14">
      <Seo
        title={car.name}
        description={`${car.name} – ${car.category}. Lej hos ${brand.name} gennem One2move Biludlejning.`}
      />
      <Link to="/biludlejning" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbage til biludlejning
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-brand-ink/5">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-accent">{car.category}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-brand-primary lg:text-3xl">{car.name}</h1>
          <p className="mt-4 leading-relaxed text-brand-ink/70">{car.description}</p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            <li className="flex items-center gap-2 text-sm text-brand-ink/70">
              <Users className="h-4 w-4 text-brand-accent" aria-hidden /> {car.seats} personer
            </li>
            <li className="flex items-center gap-2 text-sm text-brand-ink/70">
              <Settings2 className="h-4 w-4 text-brand-accent" aria-hidden /> {car.transmission}
            </li>
            <li className="flex items-center gap-2 text-sm text-brand-ink/70">
              <Fuel className="h-4 w-4 text-brand-accent" aria-hidden /> {car.fuel}
            </li>
          </ul>

          <h2 className="mt-6 font-semibold text-brand-ink">Inkluderet</h2>
          <ul className="mt-2 space-y-1.5">
            {car.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-brand-ink/70">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-brand-surface-warm/60 p-6 text-center">
          <p className="font-display text-3xl font-bold text-brand-primary">Fra {car.priceFrom} kr./dag</p>
          <p className="mt-1 text-sm text-brand-ink/60">Vejledende pris – se opdaterede priser og ledighed hos One2move</p>
          <a
            href={ONE2MOVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-brand-gradient px-5 py-3 font-semibold text-white hover:opacity-90"
          >
            Book hos One2move
          </a>
          <p className="mt-4 text-xs text-brand-ink/50">
            Booking, udlevering og aflevering foregår hos vores samarbejdspartner{" "}
            <a href={ONE2MOVE_URL} target="_blank" rel="noopener noreferrer" className="underline">
              One2move Biludlejning
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
