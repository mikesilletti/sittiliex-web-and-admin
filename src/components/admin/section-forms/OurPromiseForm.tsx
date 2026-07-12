"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { OurPromiseContent } from "@/types/content";

export function OurPromiseForm({ id, content }: { id: string; content: OurPromiseContent }) {
  const [state, setState] = useState(content);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function save() {
    startTransition(async () => {
      const result = await updateSectionContent(id, state);
      setStatus(result.error ? "error" : "saved");
    });
  }

  function update<K extends keyof OurPromiseContent>(key: K, value: OurPromiseContent[K]) {
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

      <SaveBar isPending={isPending} status={status} onSave={save} />
    </div>
  );
}
