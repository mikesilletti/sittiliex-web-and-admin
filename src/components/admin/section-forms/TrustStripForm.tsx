"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Input } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { TrustStripContent } from "@/types/content";

export function TrustStripForm({ id, content }: { id: string; content: TrustStripContent }) {
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

  function update<K extends keyof TrustStripContent>(key: K, value: TrustStripContent[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Commitment badges" hint="Short trust statements shown as pills.">
        <RepeatableList
          items={state.badges}
          onChange={(next) => update("badges", next)}
          createItem={() => ({ id: crypto.randomUUID(), label: "" })}
          addLabel="+ Add badge"
          renderItem={(badge, index) => (
            <Input
              value={badge.label}
              onChange={(e) => {
                const next = [...state.badges];
                next[index] = { ...next[index], label: e.target.value };
                update("badges", next);
              }}
            />
          )}
        />
      </Field>

      <Field label="Marquee items" hint="Scrolling ticker phrases.">
        <RepeatableList
          items={state.marqueeItems}
          onChange={(next) => update("marqueeItems", next)}
          createItem={() => ""}
          addLabel="+ Add phrase"
          renderItem={(item, index) => (
            <Input
              value={item}
              onChange={(e) => {
                const next = [...state.marqueeItems];
                next[index] = e.target.value;
                update("marqueeItems", next);
              }}
            />
          )}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
