"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { IndustriesGridContent } from "@/types/content";

export function IndustriesGridForm({ id, content }: { id: string; content: IndustriesGridContent }) {
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

  function update<K extends keyof IndustriesGridContent>(key: K, value: IndustriesGridContent[K]) {
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

      <Field label="Industries list" hint="Scrolling marquee of industry names.">
        <RepeatableList
          items={state.industries}
          onChange={(next) => update("industries", next)}
          createItem={() => ""}
          addLabel="+ Add industry"
          renderItem={(item, index) => (
            <Input
              value={item}
              onChange={(e) => {
                const next = [...state.industries];
                next[index] = e.target.value;
                update("industries", next);
              }}
            />
          )}
        />
      </Field>

      <Field label="Featured industry tiles" hint="Photo tiles with name and alt text.">
        <RepeatableList
          items={state.featuredIndustries}
          onChange={(next) => update("featuredIndustries", next)}
          createItem={() => ({ id: crypto.randomUUID(), name: "", image: "", alt: "" })}
          addLabel="+ Add featured industry"
          renderItem={(item, index) => (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Name"
                value={item.name}
                onChange={(e) => {
                  const next = [...state.featuredIndustries];
                  next[index] = { ...next[index], name: e.target.value };
                  update("featuredIndustries", next);
                }}
              />
              <Input
                placeholder="Short description (optional)"
                value={item.description ?? ""}
                onChange={(e) => {
                  const next = [...state.featuredIndustries];
                  next[index] = { ...next[index], description: e.target.value };
                  update("featuredIndustries", next);
                }}
              />
              <MediaUploadField
                placeholder="Image"
                value={item.image}
                onChange={(url) => {
                  const next = [...state.featuredIndustries];
                  next[index] = { ...next[index], image: url };
                  update("featuredIndustries", next);
                }}
              />
              <Input
                placeholder="Alt text"
                value={item.alt}
                onChange={(e) => {
                  const next = [...state.featuredIndustries];
                  next[index] = { ...next[index], alt: e.target.value };
                  update("featuredIndustries", next);
                }}
              />
            </div>
          )}
        />
      </Field>

      <Field label="'What We Look For' heading">
        <Input
          value={state.whatWeLookForHeading}
          onChange={(e) => update("whatWeLookForHeading", e.target.value)}
        />
      </Field>
      <Field label="'What We Look For' list">
        <RepeatableList
          items={state.whatWeLookFor}
          onChange={(next) => update("whatWeLookFor", next)}
          createItem={() => ""}
          addLabel="+ Add item"
          renderItem={(item, index) => (
            <Input
              value={item}
              onChange={(e) => {
                const next = [...state.whatWeLookFor];
                next[index] = e.target.value;
                update("whatWeLookFor", next);
              }}
            />
          )}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
