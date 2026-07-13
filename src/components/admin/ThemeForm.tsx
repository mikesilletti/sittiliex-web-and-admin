"use client";

import { useState, useTransition } from "react";
import { ColorInput } from "@/components/admin/ColorInput";
import { SaveBar } from "@/components/admin/SaveBar";
import { FONT_PAIRING_OPTIONS } from "@/lib/fonts-meta";
import { saveTheme } from "@/lib/admin/settings-actions";
import type { ThemeInput } from "@/lib/admin/settings-schemas";

export function ThemeForm({ initial }: { initial: ThemeInput }) {
  const [state, setState] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function update<K extends keyof ThemeInput>(key: K, value: ThemeInput[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  function save() {
    startTransition(async () => {
      const result = await saveTheme(state);
      setStatus(result.error ? "error" : "saved");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-medium text-foreground">Backgrounds</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorInput label="Base" value={state.color_background} onChange={(v) => update("color_background", v)} />
          <ColorInput
            label="Raised"
            value={state.color_background_raised}
            onChange={(v) => update("color_background_raised", v)}
          />
          <ColorInput
            label="Overlay"
            value={state.color_background_overlay}
            onChange={(v) => update("color_background_overlay", v)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Foreground / Text</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorInput label="Default" value={state.color_foreground} onChange={(v) => update("color_foreground", v)} />
          <ColorInput
            label="Muted"
            value={state.color_foreground_muted}
            onChange={(v) => update("color_foreground_muted", v)}
          />
          <ColorInput
            label="Subtle"
            value={state.color_foreground_subtle}
            onChange={(v) => update("color_foreground_subtle", v)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Accent</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorInput label="Default" value={state.color_accent} onChange={(v) => update("color_accent", v)} />
          <ColorInput label="Hover" value={state.color_accent_hover} onChange={(v) => update("color_accent_hover", v)} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Borders</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorInput label="Default" value={state.color_border} onChange={(v) => update("color_border", v)} />
          <ColorInput label="Strong" value={state.color_border_strong} onChange={(v) => update("color_border_strong", v)} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Font Pairing</h2>
        <select
          value={state.font_pairing_id}
          onChange={(e) => update("font_pairing_id", e.target.value)}
          className="focus-ring mt-3 w-full max-w-sm rounded-sm border border-border-strong bg-background-raised px-4 py-3 text-sm text-foreground"
        >
          {FONT_PAIRING_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground">Preview</h2>
        <div
          className="mt-3 rounded-md border p-6"
          style={{
            backgroundColor: state.color_background,
            borderColor: state.color_border,
            color: state.color_foreground,
          }}
        >
          <p className="text-xs uppercase tracking-wide" style={{ color: state.color_accent }}>
            Eyebrow Preview
          </p>
          <p className="mt-2 text-xl font-semibold">Heading Preview</p>
          <p className="mt-1 text-sm" style={{ color: state.color_foreground_muted }}>
            Muted body text preview.
          </p>
          <button
            className="mt-4 rounded-md px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: state.color_accent, color: state.color_background }}
          >
            Accent Button
          </button>
        </div>
      </div>

      <SaveBar isPending={isPending} status={status} onSave={save} />
    </div>
  );
}
