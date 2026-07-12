"use client";

import { Input } from "@/components/ui/Input";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const isValid = HEX.test(value);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-sm border border-border-strong bg-transparent p-0.5"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={!isValid ? "border-red-400/60" : undefined}
        />
      </div>
      {!isValid && <span className="text-xs text-red-400">Must be a hex color like #1ab4ff.</span>}
    </label>
  );
}
