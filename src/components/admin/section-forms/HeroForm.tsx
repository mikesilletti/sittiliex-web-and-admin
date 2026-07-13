"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import type { HeroContent } from "@/types/content";

export function HeroForm({ id, content }: { id: string; content: HeroContent }) {
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

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Eyebrow">
        <Input value={state.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
      </Field>

      <Field label="Headline lines" hint="Check 'accent' to render a line in the brand blue glow color.">
        <RepeatableList
          items={state.headlineLines}
          onChange={(next) => update("headlineLines", next)}
          createItem={() => ({ text: "", accent: false })}
          addLabel="+ Add line"
          renderItem={(line, index) => (
            <div className="flex flex-col gap-2">
              <Input
                value={line.text}
                onChange={(e) => {
                  const next = [...state.headlineLines];
                  next[index] = { ...next[index], text: e.target.value };
                  update("headlineLines", next);
                }}
              />
              <label className="flex items-center gap-2 text-xs text-foreground-muted">
                <input
                  type="checkbox"
                  checked={line.accent}
                  onChange={(e) => {
                    const next = [...state.headlineLines];
                    next[index] = { ...next[index], accent: e.target.checked };
                    update("headlineLines", next);
                  }}
                />
                Accent color
              </label>
            </div>
          )}
        />
      </Field>

      <Field label="Subhead">
        <Textarea value={state.subhead} onChange={(e) => update("subhead", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Primary CTA label">
          <Input
            value={state.primaryCta.label}
            onChange={(e) => update("primaryCta", { ...state.primaryCta, label: e.target.value })}
          />
        </Field>
        <Field label="Primary CTA link" hint="e.g. #contact">
          <Input
            value={state.primaryCta.href}
            onChange={(e) => update("primaryCta", { ...state.primaryCta, href: e.target.value })}
          />
        </Field>
        <Field label="Secondary CTA label">
          <Input
            value={state.secondaryCta.label}
            onChange={(e) => update("secondaryCta", { ...state.secondaryCta, label: e.target.value })}
          />
        </Field>
        <Field label="Secondary CTA link" hint="e.g. #process">
          <Input
            value={state.secondaryCta.href}
            onChange={(e) => update("secondaryCta", { ...state.secondaryCta, href: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Background image">
        <MediaUploadField
          value={state.backgroundImage}
          onChange={(url) => update("backgroundImage", url)}
        />
      </Field>
      <Field label="Background image alt text" hint="Leave blank if purely decorative.">
        <Input
          value={state.backgroundImageAlt}
          onChange={(e) => update("backgroundImageAlt", e.target.value)}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
