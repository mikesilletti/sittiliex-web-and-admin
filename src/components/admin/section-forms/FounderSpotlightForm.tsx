"use client";

import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { FactsEditor } from "@/components/admin/FactsEditor";
import { Input, Textarea } from "@/components/ui/Input";
import { useSectionForm } from "@/components/admin/section-forms/use-section-form";
import type { FounderSpotlightContent } from "@/types/content";

export function FounderSpotlightForm({ id, content }: { id: string; content: FounderSpotlightContent }) {
  const { state, update, saveBarProps } = useSectionForm(id, content);

  return (
    <div className="flex flex-col gap-6">
      <Field label="Eyebrow" hint="Small blue label above the heading.">
        <Input value={state.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
      </Field>
      <Field label="Heading">
        <Input value={state.heading} onChange={(e) => update("heading", e.target.value)} />
      </Field>
      <Field label="Short bio">
        <Textarea value={state.body} onChange={(e) => update("body", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Photo" hint="Portrait (taller than wide) works best.">
          <MediaUploadField value={state.image} onChange={(url) => update("image", url)} />
        </Field>
        <Field label="Photo alt text">
          <Input value={state.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
        </Field>
      </div>

      <Field label="Fact strip" hint="Up to 3 reads best on phones.">
        <FactsEditor facts={state.facts} onChange={(next) => update("facts", next)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Link label" hint="Leave blank to hide the link.">
          <Input value={state.linkLabel} onChange={(e) => update("linkLabel", e.target.value)} />
        </Field>
        <Field label="Link goes to" hint="e.g. /about">
          <Input value={state.linkHref} onChange={(e) => update("linkHref", e.target.value)} />
        </Field>
      </div>

      <SaveBar {...saveBarProps} />
    </div>
  );
}
