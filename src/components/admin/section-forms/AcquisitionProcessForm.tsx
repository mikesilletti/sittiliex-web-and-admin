"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { AcquisitionProcessContent, ProcessStep } from "@/types/content";

function reindex(steps: ProcessStep[]): ProcessStep[] {
  return steps.map((step, i) => ({ ...step, index: i + 1 }));
}

export function AcquisitionProcessForm({
  id,
  content,
}: {
  id: string;
  content: AcquisitionProcessContent;
}) {
  const [state, setState] = useState(content);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function save() {
    startTransition(async () => {
      const result = await updateSectionContent(id, state);
      setStatus(result.error ? "error" : "saved");
    });
  }

  function update<K extends keyof AcquisitionProcessContent>(
    key: K,
    value: AcquisitionProcessContent[K]
  ) {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Image URL">
          <Input value={state.image} onChange={(e) => update("image", e.target.value)} />
        </Field>
        <Field label="Image alt text">
          <Input value={state.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
        </Field>
      </div>

      <Field label="Process steps" hint="Numbered automatically in order.">
        <RepeatableList
          items={state.steps}
          onChange={(next) => update("steps", reindex(next))}
          createItem={() => ({ id: crypto.randomUUID(), index: state.steps.length + 1, title: "", description: "" })}
          addLabel="+ Add step"
          renderItem={(step, index) => (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-foreground-subtle">Step {step.index}</p>
              <Input
                placeholder="Title"
                value={step.title}
                onChange={(e) => {
                  const next = [...state.steps];
                  next[index] = { ...next[index], title: e.target.value };
                  update("steps", next);
                }}
              />
              <Textarea
                placeholder="Description"
                value={step.description}
                onChange={(e) => {
                  const next = [...state.steps];
                  next[index] = { ...next[index], description: e.target.value };
                  update("steps", next);
                }}
              />
            </div>
          )}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} />
    </div>
  );
}
