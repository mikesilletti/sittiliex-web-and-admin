"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CheckCircle2, Handshake, MessageSquare, ShieldCheck } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";
import {
  INQUIRY_TYPE_LABELS,
  PARTNER_TYPE_OPTIONS,
  PROFIT_OPTIONS,
  REVENUE_OPTIONS,
  TIMING_OPTIONS,
  inquirySchema,
  type InquiryType,
  type Option,
} from "@/lib/contact-schema";

type Status = "idle" | "submitting" | "success" | "error";

export interface InquiryFormCopy {
  namePlaceholder: string;
  emailPlaceholder: string;
  companyPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successHeading: string;
  successMessage: string;
  errorMessage: string;
}

const PATHS: { type: InquiryType; icon: typeof Briefcase; blurb: string }[] = [
  { type: "sell", icon: Briefcase, blurb: "Find out what your business could sell for — confidentially." },
  { type: "partner", icon: Handshake, blurb: "Operators, investors, brokers and referral partners." },
  { type: "other", icon: MessageSquare, blurb: "Questions, press, or anything else." },
];

const SUBMIT_LABELS: Partial<Record<InquiryType, string>> = {
  sell: "Start My Confidential Review",
  partner: "Send to Our Team",
};

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  industry: "",
  location: "",
  revenue: "",
  profit: "",
  timing: "",
  askingPrice: "",
  partnerType: "",
  linkedin: "",
  message: "",
  website: "",
};
type Values = typeof EMPTY;

const FIELDS_BY_TYPE: Record<InquiryType, (keyof Values)[]> = {
  sell: ["name", "email", "phone", "company", "industry", "location", "revenue", "profit", "timing", "askingPrice", "message"],
  partner: ["name", "email", "phone", "company", "partnerType", "linkedin", "message"],
  other: ["name", "email", "phone", "company", "message"],
};

export function InquiryForm({ copy }: { copy: InquiryFormCopy }) {
  const [type, setType] = useState<InquiryType>("sell");
  const [values, setValues] = useState<Values>(EMPTY);
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const shouldReduceMotion = useReducedMotion();
  const formId = useId();

  function set(field: keyof Values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
    };
  }

  function switchType(next: InquiryType) {
    setType(next);
    setErrors({});
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      type,
      smsConsent,
      ...Object.fromEntries(FIELDS_BY_TYPE[type].map((f) => [f, values[f]])),
      ...(values.website ? { website: values.website } : {}),
    };
    const result = inquirySchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const first = FIELDS_BY_TYPE[type].find((f) => fieldErrors[f]);
      if (first) document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-accent/30 bg-background-raised p-10 text-center">
        <CheckCircle2 size={32} className="mx-auto text-accent" />
        <h3 className="mt-4 text-lg font-heading font-semibold text-foreground">{copy.successHeading}</h3>
        <p className="mt-2 text-body-md text-foreground-muted">{copy.successMessage}</p>
      </div>
    );
  }

  const field = (name: keyof Values) => ({
    id: `${formId}-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    "aria-invalid": !!errors[name] || undefined,
    "aria-describedby": errors[name] ? `${formId}-${name}-error` : undefined,
  });

  const activePath = PATHS.find((p) => p.type === type)!;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-lg border border-border bg-background-raised/80 p-5 backdrop-blur-sm sm:p-7"
    >
      <div role="tablist" aria-label="What can we help with?" className="grid grid-cols-3 gap-1.5 rounded-md border border-border bg-background p-1.5">
        {PATHS.map(({ type: t, icon: Icon }) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            onClick={() => switchType(t)}
            className={cn(
              "focus-ring relative flex flex-col items-center gap-1 rounded-sm px-2 py-2.5 text-center text-[11px] font-medium leading-tight transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:text-xs",
              type === t ? "text-background" : "text-foreground-muted hover:text-foreground"
            )}
          >
            {type === t && (
              <motion.span
                layoutId={`${formId}-tab`}
                className="absolute inset-0 rounded-sm bg-accent"
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={15} className="relative shrink-0" />
            <span className="relative">{INQUIRY_TYPE_LABELS[t]}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-foreground-muted">
        <ShieldCheck size={14} className="shrink-0 text-accent" />
        {activePath.blurb} 100% confidential.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={type}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <Field label="Full name" error={errors.name} id={`${formId}-name`} required>
            <Input {...field("name")} autoComplete="name" placeholder={copy.namePlaceholder} />
          </Field>
          <Field label="Email" error={errors.email} id={`${formId}-email`} required>
            <Input {...field("email")} type="email" autoComplete="email" placeholder={copy.emailPlaceholder} />
          </Field>
          <Field label="Phone" error={errors.phone} id={`${formId}-phone`} required={type === "sell"}>
            <Input {...field("phone")} type="tel" autoComplete="tel" placeholder="(555) 555-5555" />
          </Field>
          <Field
            label={type === "sell" ? "Company name" : "Company"}
            error={errors.company}
            id={`${formId}-company`}
            required={type === "sell"}
          >
            <Input
              {...field("company")}
              autoComplete="organization"
              placeholder={type === "sell" ? "Your business name" : copy.companyPlaceholder}
            />
          </Field>

          {type === "sell" && (
            <>
              <Field label="Industry" error={errors.industry} id={`${formId}-industry`} required>
                <Input {...field("industry")} placeholder="e.g. HVAC, cleaning, roofing" />
              </Field>
              <Field label="Business location" error={errors.location} id={`${formId}-location`} required>
                <Input {...field("location")} autoComplete="address-level2" placeholder="City, State" />
              </Field>
              <Field label="Annual revenue" error={errors.revenue} id={`${formId}-revenue`} required>
                <ChoiceSelect {...field("revenue")} options={REVENUE_OPTIONS} placeholder="Select a range" />
              </Field>
              <Field label="Annual profit (after all expenses)" error={errors.profit} id={`${formId}-profit`} required>
                <ChoiceSelect {...field("profit")} options={PROFIT_OPTIONS} placeholder="Select a range" />
              </Field>
              <Field label="When would you consider selling?" error={errors.timing} id={`${formId}-timing`} required>
                <ChoiceSelect {...field("timing")} options={TIMING_OPTIONS} placeholder="Select a timeframe" />
              </Field>
              <Field label="Ideal sale price" error={errors.askingPrice} id={`${formId}-askingPrice`} required>
                <Input {...field("askingPrice")} placeholder={'e.g. $1.5M, or "Need an appraisal"'} />
              </Field>
              <Field label="Anything else we should know?" error={errors.message} id={`${formId}-message`} wide>
                <Textarea {...field("message")} className="min-h-24" placeholder="Reason for selling, number of employees, real estate included…" />
              </Field>
            </>
          )}

          {type === "partner" && (
            <>
              <Field label="What best describes you?" error={errors.partnerType} id={`${formId}-partnerType`} required wide>
                <ChoiceSelect {...field("partnerType")} options={PARTNER_TYPE_OPTIONS} placeholder="Select one" />
              </Field>
              <Field label="LinkedIn or website" error={errors.linkedin} id={`${formId}-linkedin`} wide>
                <Input {...field("linkedin")} type="url" placeholder="https://linkedin.com/in/…" />
              </Field>
              <Field label="How would you like to work together?" error={errors.message} id={`${formId}-message`} required wide>
                <Textarea {...field("message")} placeholder="Your background, what you bring, and what you're looking for" />
              </Field>
            </>
          )}

          {type === "other" && (
            <Field label="How can we help?" error={errors.message} id={`${formId}-message`} required wide>
              <Textarea {...field("message")} placeholder={copy.messagePlaceholder} />
            </Field>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={set("website")} />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[11px] leading-relaxed text-foreground-subtle">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
        />
        <span>
          Optional: I agree to receive text messages from SillettiX about my inquiry at the number above. Message
          frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a
          condition of any purchase or sale. See our{" "}
          <Link href="/privacy" className="text-foreground-muted underline hover:text-foreground">Privacy Policy</Link> and{" "}
          <Link href="/terms" className="text-foreground-muted underline hover:text-foreground">Terms</Link>.
        </span>
      </label>

      <MagneticButton strength={0.2} className="mt-5 w-full">
        <Button type="submit" variant="primary" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? copy.submittingLabel : SUBMIT_LABELS[type] ?? copy.submitLabel}
        </Button>
      </MagneticButton>

      {status === "error" && <p className="mt-3 text-xs text-red-400">{copy.errorMessage}</p>}
    </form>
  );
}

function Field({
  label,
  id,
  error,
  required,
  wide,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground-muted">
        {label}
        {required ? <span className="ml-0.5 text-accent">*</span> : <span className="ml-1 text-foreground-subtle">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceSelect({
  options,
  placeholder,
  ...props
}: { options: Option[]; placeholder: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props} required>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
