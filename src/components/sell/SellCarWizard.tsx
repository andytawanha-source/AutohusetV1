import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WizardProgress } from "./WizardProgress";
import { StepPlate } from "./StepPlate";
import { StepConfirmVehicle } from "./StepConfirmVehicle";
import { StepCondition } from "./StepCondition";
import { StepPhotos } from "./StepPhotos";
import { StepContact } from "./StepContact";
import { StepConsent } from "./StepConsent";
import { lookupPlate } from "@/features/plate-lookup/client";
import { submitSellCarLead } from "@/features/leads/api";
import type {
  ConditionStepInput,
  ConsentStepInput,
  ContactStepInput,
  ManualVehicleInput,
  PlateStepInput,
  SellCarState,
} from "@/features/leads/schema";
import { track } from "@/features/tracking/track";

export function SellCarWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<SellCarState>({ photos: [] });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const startTracked = useRef(false);

  useEffect(() => {
    if (!startTracked.current) {
      startTracked.current = true;
      track("start_sell_car", { source: "sell_car_page" });
    }
  }, []);

  // Flyt fokus til toppen af trinnet ved skift (tilgængelighed)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
    window.scrollTo({ top: 0 });
  }, [step]);

  const goTo = (next: number) => {
    if (next > step) track("sell_car_step_completed", { step: step + 1 });
    setStep(next);
  };

  const handlePlate = async (data: PlateStepInput) => {
    setLookupError(null);
    setIsLookingUp(true);
    track("plate_lookup_started", {});
    const outcome = await lookupPlate(data.registrationNumber);
    setIsLookingUp(false);

    switch (outcome.status) {
      case "success":
        track("plate_lookup_success", { provider: outcome.result.provider });
        setState((s) => ({ ...s, plate: data, lookup: outcome.result }));
        goTo(1);
        break;
      case "not_found":
        track("plate_lookup_failed", { reason: "not_found" });
        setState((s) => ({ ...s, plate: data, lookup: null }));
        goTo(1); // Manuel indtastning tilbydes på trin 2
        break;
      case "rate_limited":
        track("plate_lookup_failed", { reason: "rate_limited" });
        setLookupError("Du har lavet for mange opslag på kort tid. Vent et øjeblik og prøv igen.");
        break;
      case "disabled":
      case "error":
      default:
        track("plate_lookup_failed", { reason: outcome.status });
        setState((s) => ({ ...s, plate: data, lookup: null }));
        goTo(1); // API-fejl må ikke blokere – manuel fortsættelse (spec pkt. 25)
        break;
    }
  };

  const handleSubmit = async (consent: ConsentStepInput) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await submitSellCarLead(state, consent);
      track("submit_sell_car_lead", { reference: result.reference, is_demo: result.isDemo });
      navigate(`/saelg-din-bil/tak/${encodeURIComponent(result.reference)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Noget gik galt. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <WizardProgress current={step} />
      <div
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 animate-fade-up rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-ink/5 outline-none sm:p-8"
        key={step}
      >
        {step === 0 && (
          <StepPlate
            defaultValues={{
              registrationNumber: state.plate?.registrationNumber ?? searchParams.get("plade") ?? "",
              mileageKm: state.plate?.mileageKm ?? (searchParams.get("km") ? Number(searchParams.get("km")) : undefined),
            }}
            isLookingUp={isLookingUp}
            lookupError={lookupError}
            onSubmit={handlePlate}
          />
        )}
        {step === 1 && (
          <StepConfirmVehicle
            lookup={state.lookup ?? null}
            manualDefault={state.manualVehicle}
            onConfirm={() => goTo(2)}
            onManual={(manual: ManualVehicleInput) => {
              setState((s) => ({ ...s, manualVehicle: manual, lookup: null }));
              goTo(2);
            }}
            onBack={() => goTo(0)}
          />
        )}
        {step === 2 && (
          <StepCondition
            defaultValues={state.condition}
            onSubmit={(condition: ConditionStepInput) => {
              setState((s) => ({ ...s, condition }));
              goTo(3);
            }}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && (
          <StepPhotos
            photos={state.photos}
            onChange={(photos) => setState((s) => ({ ...s, photos }))}
            onNext={() => goTo(4)}
            onBack={() => goTo(2)}
          />
        )}
        {step === 4 && (
          <StepContact
            defaultValues={state.contact}
            onSubmit={(contact: ContactStepInput) => {
              setState((s) => ({ ...s, contact }));
              goTo(5);
            }}
            onBack={() => goTo(3)}
          />
        )}
        {step === 5 && (
          <StepConsent
            state={state}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            onBack={() => goTo(4)}
          />
        )}
      </div>
    </div>
  );
}
