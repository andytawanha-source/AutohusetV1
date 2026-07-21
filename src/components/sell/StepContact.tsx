import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { contactStepSchema, type ContactStepInput } from "@/features/leads/schema";
import { FieldError, inputCls, RadioPills } from "./fields";

export function StepContact({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues?: Partial<ContactStepInput>;
  onSubmit: (data: ContactStepInput) => void;
  onBack: () => void;
}) {
  const { control, register, handleSubmit, formState } = useForm<ContactStepInput>({
    resolver: zodResolver(contactStepSchema),
    defaultValues,
  });
  const err = formState.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-primary">Dine kontaktoplysninger</h2>
        <p className="mt-1 text-sm text-brand-ink/70">Så vi kan sende dig dit uforpligtende tilbud.</p>
      </div>

      <div>
        <label htmlFor="cs-name" className="mb-1 block text-sm font-medium">Navn *</label>
        <input id="cs-name" autoComplete="name" className={inputCls} {...register("name")} aria-invalid={!!err.name} />
        <FieldError id="cs-name-err" message={err.name?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cs-phone" className="mb-1 block text-sm font-medium">Telefon *</label>
          <input id="cs-phone" type="tel" autoComplete="tel" className={inputCls} {...register("phone")} aria-invalid={!!err.phone} />
          <FieldError id="cs-phone-err" message={err.phone?.message} />
        </div>
        <div>
          <label htmlFor="cs-email" className="mb-1 block text-sm font-medium">E-mail *</label>
          <input id="cs-email" type="email" autoComplete="email" className={inputCls} {...register("email")} aria-invalid={!!err.email} />
          <FieldError id="cs-email-err" message={err.email?.message} />
        </div>
        <div>
          <label htmlFor="cs-zip" className="mb-1 block text-sm font-medium">Postnummer *</label>
          <input id="cs-zip" inputMode="numeric" autoComplete="postal-code" maxLength={4} className={inputCls} {...register("postalCode")} aria-invalid={!!err.postalCode} />
          <FieldError id="cs-zip-err" message={err.postalCode?.message} />
        </div>
        <div>
          <label htmlFor="cs-time" className="mb-1 block text-sm font-medium">Bedste tidspunkt at kontakte dig</label>
          <input id="cs-time" className={inputCls} placeholder="fx hverdage efter kl. 16" {...register("bestContactTime")} />
        </div>
      </div>

      <Controller
        control={control}
        name="preferredChannel"
        render={({ field }) => (
          <RadioPills
            legend="Hvordan må vi kontakte dig? *"
            name="preferredChannel"
            options={[
              { value: "phone", label: "Telefon" },
              { value: "email", label: "E-mail" },
              { value: "sms", label: "SMS" },
            ]}
            value={field.value}
            onChange={field.onChange}
            error={err.preferredChannel?.message}
          />
        )}
      />

      <div>
        <label htmlFor="cs-message" className="mb-1 block text-sm font-medium">Supplerende besked</label>
        <textarea id="cs-message" rows={3} className={inputCls} {...register("message")} />
      </div>

      {/* Honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="cs-website">Udfyld ikke dette felt</label>
        <input id="cs-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-brand-ink/60 hover:text-brand-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbage
        </button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand-gradient px-5 py-3 font-semibold text-white hover:opacity-90">
          Fortsæt <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
