"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import { CONTACT_COPY_DEFAULTS, type ContactCopyKey } from "@/lib/content-defaults";
import type { ContactContent } from "@/types/content";

const COPY_FIELDS: { key: ContactCopyKey; label: string; multiline?: boolean }[] = [
  { key: "emailLabel", label: "Text before email" },
  { key: "phoneLabel", label: "Text before phone" },
  { key: "namePlaceholder", label: "Name field placeholder" },
  { key: "emailPlaceholder", label: "Email field placeholder" },
  { key: "companyPlaceholder", label: "Company field placeholder" },
  { key: "messagePlaceholder", label: "Message field placeholder" },
  { key: "submitLabel", label: "Submit button" },
  { key: "submittingLabel", label: "Submit button while sending" },
  { key: "successHeading", label: "Success heading" },
  { key: "successMessage", label: "Success message", multiline: true },
  { key: "errorMessage", label: "Error message", multiline: true },
];

export function ContactForm({ id, content }: { id: string; content: ContactContent }) {
  const [state, setState] = useState(content);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function save() {
    startTransition(async () => {
      const result = await updateSectionContent(id, state);
      setSaveError(result.error);
      setStatus(result.error ? "error" : "saved");
    });
  }

  function update<K extends keyof ContactContent>(key: K, value: ContactContent[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Eyebrow">
        <Input value={state.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
      </Field>
      <Field label="Heading">
        <Input value={state.heading} onChange={(e) => update("heading", e.target.value)} />
      </Field>
      <Field label="Body">
        <Textarea value={state.body} onChange={(e) => update("body", e.target.value)} />
      </Field>
      <Field label="Contact email">
        <Input type="email" value={state.email} onChange={(e) => update("email", e.target.value)} />
      </Field>
      <Field label="Contact phone">
        <Input
          type="tel"
          value={state.phone ?? ""}
          onChange={(e) => update("phone", e.target.value)}
        />
      </Field>
      <Field label="Background image">
        <MediaUploadField
          value={state.backgroundImage}
          onChange={(url) => update("backgroundImage", url)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COPY_FIELDS.map(({ key, label, multiline }) => (
          <div key={key} className={multiline ? "sm:col-span-2" : undefined}>
            <Field label={label}>
              {multiline ? (
                <Textarea
                  value={state[key] ?? CONTACT_COPY_DEFAULTS[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              ) : (
                <Input
                  value={state[key] ?? CONTACT_COPY_DEFAULTS[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              )}
            </Field>
          </div>
        ))}
      </div>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
