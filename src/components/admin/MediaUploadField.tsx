"use client";

import { useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { uploadMedia, listMedia } from "@/lib/admin/media-actions";
import { cn } from "@/lib/utils";

type LibraryState =
  | { status: "closed" }
  | { status: "loading" }
  | { status: "open"; items: { url: string; name: string }[] };

export function MediaUploadField({
  value,
  onChange,
  placeholder = "image",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [library, setLibrary] = useState<LibraryState>({ status: "closed" });

  function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }

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

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function toggleLibrary() {
    if (library.status !== "closed") {
      setLibrary({ status: "closed" });
      return;
    }
    setLibrary({ status: "loading" });
    startTransition(async () => {
      const result = await listMedia();
      if (result.error) {
        setError(result.error);
        setLibrary({ status: "closed" });
      } else {
        setLibrary({ status: "open", items: result.items });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${placeholder} — drag an image here or press Enter to browse`}
        onClick={() => !isPending && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isPending) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "focus-ring cursor-pointer rounded-md border border-dashed px-4 py-4 transition-colors",
          isDragOver
            ? "border-accent bg-accent/10"
            : "border-border-strong bg-background-raised hover:border-accent/40"
        )}
      >
        {value ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary URL, not eligible for next/image's remotePatterns allowlist */}
            <img
              src={value}
              alt=""
              className="h-16 w-16 shrink-0 rounded-sm border border-border object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs text-foreground">
                {isPending ? "Uploading…" : "Drop a new image to replace, or click to browse."}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-foreground-subtle">{value}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-foreground-muted">
            {isPending ? "Uploading…" : "Drag an image here, or click to browse (max 5MB)"}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLibrary}
          disabled={isPending}
          className="focus-ring rounded-sm border border-border-strong px-2.5 py-1 text-[11px] text-foreground-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        >
          {library.status === "loading"
            ? "Loading…"
            : library.status === "open"
              ? "Close library"
              : "Choose from uploads"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setError(null);
            }}
            className="focus-ring rounded-sm px-2.5 py-1 text-[11px] text-foreground-subtle hover:text-red-400"
          >
            Remove image
          </button>
        )}
      </div>

      {library.status === "open" &&
        (library.items.length === 0 ? (
          <p className="text-[11px] text-foreground-subtle">No uploads yet.</p>
        ) : (
          <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-md border border-border p-2 sm:grid-cols-6">
            {library.items.map((item) => (
              <button
                key={item.url}
                type="button"
                title={item.name}
                onClick={() => {
                  onChange(item.url);
                  setLibrary({ status: "closed" });
                }}
                className={cn(
                  "focus-ring overflow-hidden rounded-sm border transition-colors hover:border-accent",
                  value === item.url ? "border-accent" : "border-border"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnails from the bucket */}
                <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        ))}

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
