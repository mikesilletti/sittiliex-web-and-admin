"use client";

import { useState, useTransition } from "react";
import { updateSectionContent } from "@/lib/admin/section-actions";

/**
 * Local state + save wiring shared by the section forms: `update` sets one
 * field and clears the "saved" badge, `save` validates and writes the whole
 * object through updateSectionContent.
 */
export function useSectionForm<T extends object>(id: string, content: T) {
  const [state, setState] = useState(content);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function update<K extends keyof T>(key: K, value: T[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  function save() {
    startTransition(async () => {
      const result = await updateSectionContent(id, state as never);
      setSaveError(result.error);
      setStatus(result.error ? "error" : "saved");
    });
  }

  return { state, update, save, saveBarProps: { isPending, status, onSave: save, errorMessage: saveError } };
}
