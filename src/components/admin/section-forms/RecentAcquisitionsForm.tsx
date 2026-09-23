"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { updateSectionContent } from "@/lib/admin/section-actions";
import { PORTFOLIO_NEXT_DEFAULTS, PORTFOLIO_STATUS_LABELS, acquisitionTiles } from "@/lib/content-defaults";
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

      <Field label="Portfolio companies" hint="Shown as numbered timeline steps, in this order.">
        <RepeatableList
          items={tiles}
          onChange={updateTiles}
          createItem={(): AcquisitionTile => ({
            id: crypto.randomUUID(),
            name: "",
            subtitle: "",
            image: "",
            alt: "",
            status: "acquired",
          })}
          addLabel="+ Add company"
          renderItem={(item, index) => {
            const set = (patch: Partial<AcquisitionTile>) => {
              const next = [...tiles];
              next[index] = { ...next[index], ...patch };
              updateTiles(next);
            };
            return (
              <div className="flex flex-col gap-2">
                <Input placeholder="Company name" value={item.name} onChange={(e) => set({ name: e.target.value })} />
                <Select
                  value={item.status ?? ""}
                  onChange={(e) => set({ status: e.target.value as AcquisitionTile["status"] })}
                >
                  <option value="">No badge</option>
                  {Object.entries(PORTFOLIO_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Textarea
                  className="min-h-20"
                  placeholder="One-line description"
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

      <Field label="'Next chapter' card" hint="The final dashed card inviting owners to reach out.">
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Eyebrow"
            value={state.nextEyebrow ?? PORTFOLIO_NEXT_DEFAULTS.nextEyebrow}
            onChange={(e) => update("nextEyebrow", e.target.value)}
          />
          <Input
            placeholder="Heading"
            value={state.nextHeading ?? PORTFOLIO_NEXT_DEFAULTS.nextHeading}
            onChange={(e) => update("nextHeading", e.target.value)}
          />
          <Textarea
            className="min-h-20"
            placeholder="Body"
            value={state.nextBody ?? PORTFOLIO_NEXT_DEFAULTS.nextBody}
            onChange={(e) => update("nextBody", e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              placeholder="Link label"
              value={state.cta.label}
              onChange={(e) => update("cta", { ...state.cta, label: e.target.value })}
            />
            <Input
              placeholder="Link (e.g. #contact)"
              value={state.cta.href}
              onChange={(e) => update("cta", { ...state.cta, href: e.target.value })}
            />
          </div>
        </div>
      </Field>

      <SaveBar isPending={isPending} status={status} onSave={save} errorMessage={saveError} />
    </div>
  );
}
