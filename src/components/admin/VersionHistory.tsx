"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export interface VersionItem {
  id: string;
  title: string;
  detail: string;
}

export function VersionHistory({
  heading,
  description,
  items,
  restoreAction,
  buttonLabel = "Restore",
  emptyText = "Nothing here yet — history appears after your first save.",
}: {
  heading: string;
  description?: string;
  items: VersionItem[];
  restoreAction: (id: string) => Promise<{ error: string | null }>;
  buttonLabel?: string;
  emptyText?: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleRestore(id: string) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await restoreAction(id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
      } else {
        // Reload server data so forms remount with the restored values.
        router.refresh();
      }
    });
  }

  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-sm font-medium text-foreground">{heading}</h2>
      {description && <p className="mt-1 text-xs text-foreground-subtle">{description}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-foreground-subtle">{emptyText}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-border bg-background-raised px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs text-foreground" suppressHydrationWarning>
                  {item.title}
                </p>
                <p className="truncate text-[11px] text-foreground-subtle" suppressHydrationWarning>
                  {item.detail}
                </p>
              </div>
              <button
                type="button"
                disabled={pendingId !== null}
                onClick={() => handleRestore(item.id)}
                className="focus-ring shrink-0 rounded-sm border border-border-strong px-2.5 py-1 text-[11px] text-foreground-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
              >
                {pendingId === item.id ? "Restoring…" : buttonLabel}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
