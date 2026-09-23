"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import { acquisitionTiles } from "@/lib/content-defaults";
import type { AcquisitionTile, RecentAcquisitionsContent } from "@/types/content";

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
      // Always persist explicit tiles so legacy sections migrate on first save.
      const result = await updateSectionContent(id, {
        ...state,
        tiles: acquisitionTiles(state),
        placeholderImages: undefined,
      });
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

  const tiles = acquisitionTiles(state);

  // Saving tiles supersedes the legacy image-only list.
  function updateTiles(next: AcquisitionTile[]) {
    setState((prev) => ({ ...prev, tiles: next, placeholderImages: undefined }));
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

      <Field label="Acquisition tiles" hint="Name, subtitle (e.g. 'Reserved' or the year) and image for each tile.">
        <RepeatableList
          items={tiles}
          onChange={updateTiles}
          createItem={() => ({ id: crypto.randomUUID(), name: "", subtitle: "", image: "", alt: "" })}
          addLabel="+ Add acquisition"
          renderItem={(item, index) => {
            const set = (patch: Partial<AcquisitionTile>) => {
              const next = [...tiles];
              next[index] = { ...next[index], ...patch };
              updateTiles(next);
            };
            return (
              <div className="flex flex-col gap-2">
                <Input placeholder="Name" value={item.name} onChange={(e) => set({ name: e.target.value })} />
                <Input
                  placeholder="Subtitle (optional)"
                  value={item.subtitle}
                  onChange={(e) => set({ subtitle: e.target.value })}
                />
                <MediaUploadField placeholder="Image" value={item.image} onChange={(url) => set({ image: url })} />
                <Input placeholder="Alt text" value={item.alt} onChange={(e) => set({ alt: e.target.value })} />
              </div>
            );
          }}
        />
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
