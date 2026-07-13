"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { RecentAcquisitionsContent } from "@/types/content";

export function RecentAcquisitionsForm({
  id,
  content,
}: {
  id: string;
  content: RecentAcquisitionsContent;
}) {
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

  function update<K extends keyof RecentAcquisitionsContent>(
    key: K,
    value: RecentAcquisitionsContent[K]
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
        <Field label="CTA label">
          <Input
            value={state.cta.label}
            onChange={(e) => update("cta", { ...state.cta, label: e.target.value })}
          />
        </Field>
        <Field label="CTA link">
          <Input
            value={state.cta.href}
            onChange={(e) => update("cta", { ...state.cta, href: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Placeholder tile images" hint="Dashed 'coming soon' tiles until real acquisitions exist.">
        <RepeatableList
          items={state.placeholderImages}
          onChange={(next) => update("placeholderImages", next)}
          createItem={() => ""}
          addLabel="+ Add image"
          renderItem={(item, index) => (
            <MediaUploadField
              value={item}
              onChange={(url) => {
                const next = [...state.placeholderImages];
                next[index] = url;
                update("placeholderImages", next);
              }}
            />
          )}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
