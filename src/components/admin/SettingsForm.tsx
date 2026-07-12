"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { saveSettings, type SettingsInput } from "@/lib/admin/settings-actions";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [state, setState] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function update<K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  function save() {
    startTransition(async () => {
      const result = await saveSettings(state);
      setStatus(result.error ? "error" : "saved");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-medium text-foreground">Site</h2>
        <div className="mt-3 flex flex-col gap-4">
          <Field label="Site name">
            <Input value={state.site_name} onChange={(e) => update("site_name", e.target.value)} />
          </Field>
          <Field label="Contact email">
            <Input
              type="email"
              value={state.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Navigation</h2>
        <div className="mt-3">
          <RepeatableList
            items={state.nav_items}
            onChange={(next) => update("nav_items", next)}
            createItem={() => ({ label: "", href: "" })}
            addLabel="+ Add nav item"
            renderItem={(item, index) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...state.nav_items];
                    next[index] = { ...next[index], label: e.target.value };
                    update("nav_items", next);
                  }}
                />
                <Input
                  placeholder="Link (e.g. #contact)"
                  value={item.href}
                  onChange={(e) => {
                    const next = [...state.nav_items];
                    next[index] = { ...next[index], href: e.target.value };
                    update("nav_items", next);
                  }}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Header CTA</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Label">
            <Input
              value={state.header_cta_label}
              onChange={(e) => update("header_cta_label", e.target.value)}
            />
          </Field>
          <Field label="Link">
            <Input
              value={state.header_cta_href}
              onChange={(e) => update("header_cta_href", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Footer</h2>
        <div className="mt-3 flex flex-col gap-4">
          <Field label="Tagline">
            <Input
              value={state.footer_tagline}
              onChange={(e) => update("footer_tagline", e.target.value)}
            />
          </Field>
          <Field label="Copyright">
            <Input
              value={state.footer_copyright}
              onChange={(e) => update("footer_copyright", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">SEO Defaults</h2>
        <div className="mt-3 flex flex-col gap-4">
          <Field label="Site title" hint="Ideally 30–60 characters.">
            <Input
              value={state.seo_site_title}
              onChange={(e) => update("seo_site_title", e.target.value)}
            />
          </Field>
          <Field label="Meta description" hint="Ideally 120–160 characters.">
            <Textarea
              value={state.seo_meta_description}
              onChange={(e) => update("seo_meta_description", e.target.value)}
            />
          </Field>
          <Field label="OG image" hint="Shown when the site is shared on social media.">
            <MediaUploadField
              value={state.seo_og_image_url ?? ""}
              onChange={(url) => update("seo_og_image_url", url || null)}
            />
          </Field>
        </div>
      </div>

      <SaveBar isPending={isPending} status={status} onSave={save} />
    </div>
  );
}
