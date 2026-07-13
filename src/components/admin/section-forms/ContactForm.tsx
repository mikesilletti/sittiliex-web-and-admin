"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { ContactContent } from "@/types/content";

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
      <Field label="Background image">
        <MediaUploadField
          value={state.backgroundImage}
          onChange={(url) => update("backgroundImage", url)}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
