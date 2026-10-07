"use client";

import { Field } from "@/components/admin/Field";
import { FormSection } from "@/components/admin/FormSection";
import { Input, Textarea } from "@/components/ui/Input";

/**
 * Google title/description for a section's standalone page. Blank fields fall
 * back to the defaults, which are shown as placeholders.
 */
export function PageSeoFields({
  path,
  title,
  description,
  defaults,
  onChange,
}: {
  path: string;
  title: string | undefined;
  description: string | undefined;
  defaults: { title: string; description: string };
  onChange: (patch: { pageTitle?: string; pageDescription?: string }) => void;
}) {
  return (
    <FormSection
      title={`Search & sharing for ${path}`}
      description="What Google and link previews show for this page. Leave blank to use the text shown in grey."
    >
      <Field label="Page title" hint={`${(title || defaults.title).length} characters. Aim for under 60.`}>
        <Input value={title ?? ""} placeholder={defaults.title} onChange={(e) => onChange({ pageTitle: e.target.value })} />
      </Field>
      <Field
        label="Page description"
        hint={`${(description || defaults.description).length} characters. Aim for 120 to 160.`}
      >
        <Textarea
          value={description ?? ""}
          placeholder={defaults.description}
          onChange={(e) => onChange({ pageDescription: e.target.value })}
        />
      </Field>
    </FormSection>
  );
}
