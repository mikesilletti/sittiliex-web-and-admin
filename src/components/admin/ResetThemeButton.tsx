"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetThemeToDefaults } from "@/lib/admin/settings-actions";

export function ResetThemeButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReset() {
    if (!confirm("Reset colors and fonts to the original SillettiX theme? The current theme is saved to history first.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resetThemeToDefaults();
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="focus-ring rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
      >
        {isPending ? "Resetting…" : "Reset to default theme"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
