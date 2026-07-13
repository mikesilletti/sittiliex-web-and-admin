"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { FaqContent } from "@/types/content";

export function FaqForm({ id, content }: { id: string; content: FaqContent }) {
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

  function update<K extends keyof FaqContent>(key: K, value: FaqContent[K]) {
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

      <Field label="Questions & Answers">
        <RepeatableList
          items={state.items}
          onChange={(next) => update("items", next)}
          createItem={() => ({ id: crypto.randomUUID(), question: "", answer: "" })}
          addLabel="+ Add question"
          emptyLabel="No FAQ items yet."
          renderItem={(item, index) => (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Question"
                value={item.question}
                onChange={(e) => {
                  const next = [...state.items];
                  next[index] = { ...next[index], question: e.target.value };
                  update("items", next);
                }}
              />
              <Textarea
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => {
                  const next = [...state.items];
                  next[index] = { ...next[index], answer: e.target.value };
                  update("items", next);
                }}
              />
            </div>
          )}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
