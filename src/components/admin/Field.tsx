import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-foreground-subtle">{hint}</span>}
    </label>
  );
}
