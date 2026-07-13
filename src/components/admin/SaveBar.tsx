"use client";

import { Button } from "@/components/ui/Button";

export function SaveBar({
  isPending,
  status,
  onSave,
  errorMessage,
}: {
  isPending: boolean;
  status: "idle" | "saved" | "error";
  onSave: () => void;
  errorMessage?: string | null;
}) {
  return (
    <div className="sticky bottom-0 mt-8 flex items-center gap-4 border-t border-border bg-background/90 py-4 backdrop-blur-sm">
      <Button type="button" onClick={onSave} disabled={isPending} className="px-6 py-2.5 text-xs">
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
      {status === "saved" && !isPending && <span className="text-xs text-accent">Saved.</span>}
      {status === "error" && !isPending && (
        <span className="text-xs text-red-400">{errorMessage || "Failed to save. Try again."}</span>
      )}
    </div>
  );
}
