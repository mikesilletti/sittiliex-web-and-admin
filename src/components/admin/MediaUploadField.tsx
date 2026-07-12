"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Input";
import { uploadMedia } from "@/lib/admin/media-actions";

export function MediaUploadField({
  value,
  onChange,
  placeholder = "Image URL",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadMedia(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="focus-ring shrink-0 rounded-sm border border-border-strong px-3 py-3 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        >
          {isPending ? "Uploading…" : "Upload"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary URL, not eligible for next/image's remotePatterns allowlist
        <img src={value} alt="" className="mt-1 h-20 w-auto rounded-sm border border-border object-cover" />
      )}
    </div>
  );
}
