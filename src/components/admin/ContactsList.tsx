"use client";

import { useEffect, useState, useTransition } from "react";
import { deleteContactSubmission } from "@/lib/admin/contact-actions";
import { useContactNotifications } from "@/components/admin/notifications/ContactNotifications";
import {
  DETAIL_LABELS,
  INQUIRY_TYPE_LABELS,
  detailValueLabel,
  type InquiryType,
} from "@/lib/contact-schema";
import type { ContactSubmission } from "@/types/content";

function downloadFile(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

const DETAIL_KEYS = Object.keys(DETAIL_LABELS);

function typeLabel(type: string) {
  return INQUIRY_TYPE_LABELS[type as InquiryType] ?? "General inquiry";
}

function toCsv(rows: ContactSubmission[]) {
  const header = [
    "Type",
    "Name",
    "Email",
    "Phone",
    "Company",
    ...DETAIL_KEYS.map((k) => DETAIL_LABELS[k]),
    "Message",
    "SMS consent",
    "Submitted",
  ]
    .map(csvEscape)
    .join(",");
  const lines = rows.map((r) =>
    [
      typeLabel(r.inquiry_type),
      r.name,
      r.email,
      r.phone ?? "",
      r.company ?? "",
      ...DETAIL_KEYS.map((k) => (r.details?.[k] ? detailValueLabel(k, r.details[k]) : "")),
      r.message,
      r.sms_consent ? "Yes" : "No",
      new Date(r.created_at).toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );
  return [header, ...lines].join("\r\n");
}

function toVCard(r: ContactSubmission) {
  // \n must be encoded as literal \n in vCard NOTE values.
  const note = `SillettiX inquiry (${new Date(r.created_at).toLocaleDateString()}): ${r.message}`
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${r.name}`,
    `N:;${r.name};;;`,
    `EMAIL;TYPE=INTERNET:${r.email}`,
    ...(r.phone ? [`TEL;TYPE=CELL:${r.phone}`] : []),
    ...(r.company ? [`ORG:${r.company}`] : []),
    `NOTE:${note}`,
    "END:VCARD",
    "",
  ].join("\r\n");
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "contact";
}

export function ContactsList({ submissions: initial }: { submissions: ContactSubmission[] }) {
  const [submissions, setSubmissions] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { markContactsSeen } = useContactNotifications();

  useEffect(() => {
    markContactsSeen();
    // Runs once per mount (visiting the page is what clears the badge) —
    // markContactsSeen is a stable useCallback, safe to omit otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(id: string) {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    const previous = submissions;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setActionError(null);
    startTransition(async () => {
      const result = await deleteContactSubmission(id);
      if (result.error) {
        setSubmissions(previous);
        setActionError("Couldn't delete the submission. Please try again.");
      }
    });
  }

  if (submissions.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-foreground-muted">
        No submissions yet. When someone fills the contact form, they&apos;ll show up here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-subtle">
          {submissions.length} submission{submissions.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() =>
            downloadFile(
              `sillettix-contacts-${new Date().toISOString().slice(0, 10)}.csv`,
              "text/csv;charset=utf-8",
              toCsv(submissions)
            )
          }
          className="focus-ring rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground"
        >
          ⤓ Download all (CSV)
        </button>
      </div>

      {actionError && <p className="text-xs text-red-400">{actionError}</p>}

      <div className="flex flex-col gap-2">
        {submissions.map((s) => {
          const expanded = expandedId === s.id;
          return (
            <div
              key={s.id}
              className="rounded-md border border-border bg-background-raised px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                  className="focus-ring flex-1 min-w-0 rounded-sm text-left"
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    <span
                      className={
                        s.inquiry_type === "sell"
                          ? "mr-2 rounded-sm bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent"
                          : "mr-2 rounded-sm bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted"
                      }
                    >
                      {typeLabel(s.inquiry_type)}
                    </span>
                    {s.name}
                    {s.company && (
                      <span className="ml-2 font-normal text-foreground-subtle">{s.company}</span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted" suppressHydrationWarning>
                    {s.email}
                    {s.phone && ` · ${s.phone}`} · {new Date(s.created_at).toLocaleString()}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => downloadFile(`${slugify(s.name)}.vcf`, "text/vcard", toVCard(s))}
                  title="Download contact card (.vcf)"
                  className="focus-ring shrink-0 rounded-sm px-2 py-1 text-xs text-foreground-muted hover:text-foreground"
                >
                  ⤓ Contact
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="focus-ring shrink-0 rounded-sm px-2 py-1 text-xs text-foreground-subtle hover:text-red-400"
                >
                  Delete
                </button>
              </div>

              {expanded && (
                <div className="mt-3 border-t border-border pt-3">
                  {Object.keys(s.details ?? {}).length > 0 && (
                    <dl className="mb-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                      {DETAIL_KEYS.filter((k) => s.details[k]).map((k) => (
                        <div key={k}>
                          <dt className="text-[11px] text-foreground-subtle">{DETAIL_LABELS[k]}</dt>
                          <dd className="text-sm text-foreground">{detailValueLabel(k, s.details[k])}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {s.message && <p className="whitespace-pre-wrap text-sm text-foreground-muted">{s.message}</p>}
                  <p className="mt-2 text-[11px] text-foreground-subtle">
                    SMS consent: {s.sms_consent ? "Yes" : "No"}
                    {" · "}
                    {s.ghl_contact_id ? (
                      <span className={s.ghl_error ? "text-amber-400" : "text-emerald-400"}>
                        {s.ghl_error ? "In GoHighLevel (with warnings)" : "Sent to GoHighLevel"}
                      </span>
                    ) : s.ghl_error ? (
                      <span className="text-red-400">Not sent to GoHighLevel</span>
                    ) : (
                      "GoHighLevel: —"
                    )}
                  </p>
                  {s.ghl_error && <p className="mt-1 break-words text-[11px] text-foreground-subtle">{s.ghl_error}</p>}
                  <a
                    href={`mailto:${s.email}?subject=${encodeURIComponent("Re: your SillettiX inquiry")}`}
                    className="focus-ring mt-3 inline-block rounded-sm text-xs text-accent hover:text-accent-hover"
                  >
                    Reply by email →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
