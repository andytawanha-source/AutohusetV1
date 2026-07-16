import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Din bil", "Bekræft", "Stand", "Billeder", "Kontakt", "Send"];

export function WizardProgress({ current }: { current: number }) {
  return (
    <nav aria-label="Trin i salgsvurderingen">
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  done && "bg-brand-primary text-white",
                  active && "bg-brand-accent text-brand-primary ring-4 ring-brand-accent/25",
                  !done && !active && "bg-brand-ink/10 text-brand-ink/50"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active ? "font-semibold text-brand-primary" : "text-brand-ink/50"
                )}
                aria-current={active ? "step" : undefined}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-sm text-brand-ink/60 sm:hidden">
        Trin {current + 1} af {STEPS.length}: {STEPS[current]}
      </p>
    </nav>
  );
}
