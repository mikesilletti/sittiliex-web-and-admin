"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { WhySellToUsContent } from "@/types/content";

export function WhySellToUsForm({ id, content }: { id: string; content: WhySellToUsContent }) {
  const [state, setState] = useState(content);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function save() {
    startTransition(async () => {
      const result = await updateSectionContent(id, state);
      setStatus(result.error ? "error" : "saved");
    });
  }

  function update<K extends keyof WhySellToUsContent>(key: K, value: WhySellToUsContent[K]) {
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
      <Field label="Intro">
        <Textarea value={state.intro} onChange={(e) => update("intro", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Image URL">
          <Input value={state.image} onChange={(e) => update("image", e.target.value)} />
        </Field>
        <Field label="Image alt text">
          <Input value={state.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
        </Field>
      </div>

      <Field label="Value points">
        <RepeatableList
          items={state.points}
          onChange={(next) => update("points", next)}
          createItem={() => ({ id: crypto.randomUUID(), title: "", description: "" })}
          addLabel="+ Add point"
          renderItem={(point, index) => (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Title"
                value={point.title}
                onChange={(e) => {
                  const next = [...state.points];
                  next[index] = { ...next[index], title: e.target.value };
                  update("points", next);
                }}
              />
              <Textarea
                placeholder="Description"
                value={point.description}
                onChange={(e) => {
                  const next = [...state.points];
                  next[index] = { ...next[index], description: e.target.value };
                  update("points", next);
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
