"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Rep } from "@/lib/reps/shared";

// ------------------------------------------------------------------ stat tile

export function Kpi({
  label,
  value,
  delta,
  deltaLabel,
  goodWhenUp = true,
  detail,
  hero,
  format = (n) => String(n),
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  goodWhenUp?: boolean;
  detail?: ReactNode;
  hero?: boolean;
  format?: (n: number) => string;
}) {
  const good = delta ? (delta > 0) === goodWhenUp : null;
  return (
    <div className={cn("rounded-md border bg-background-raised p-4", hero ? "border-accent/40" : "border-border")}>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={cn("mt-1 font-semibold", hero ? "text-3xl text-accent" : "text-2xl text-foreground")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-foreground-subtle">
        {delta !== undefined && delta !== null && deltaLabel && (
          <span className={cn(delta === 0 ? "" : good ? "text-emerald-400" : "text-red-400")}>
            {delta === 0 ? "No change" : `${delta > 0 ? "▲" : "▼"} ${format(Math.abs(delta))}`}{" "}
            <span className="text-foreground-subtle">vs {deltaLabel}</span>
          </span>
        )}
        {detail && <span className="block">{detail}</span>}
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ multi-select

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; count: number }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "focus-ring flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs transition-colors",
          selected.length ? "border-accent/60 bg-accent/10 text-foreground" : "border-border text-foreground-muted hover:text-foreground"
        )}
      >
        <span className="text-foreground-subtle">{label}:</span>
        <span className="max-w-[9rem] truncate">{summary}</span>
        <span aria-hidden className="text-foreground-subtle">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 w-64 rounded-md border border-border-strong bg-background-overlay p-2 shadow-xl">
          {options.length > 8 && (
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="focus-ring mb-2 w-full rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-foreground-subtle"
            />
          )}
          <ul role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto">
            {shown.map((o) => {
              const on = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-background-raised">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                      className="accent-[var(--color-accent)]"
                    />
                    <span className="flex-1 truncate text-foreground">{o.label}</span>
                    <span className="tabular-nums text-foreground-subtle">{o.count}</span>
                  </label>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-2 py-1.5 text-xs text-foreground-subtle">No matches</li>}
          </ul>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="focus-ring mt-1 w-full rounded-sm border-t border-border px-2 pt-2 text-left text-xs text-foreground-muted hover:text-foreground"
            >
              Clear {label.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ tabs

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string; badge?: string | number }[];
  active: T;
  onChange: (t: T) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border [scrollbar-width:none]">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          type="button"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "focus-ring -mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
            active === t.key
              ? "border-accent text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground"
          )}
        >
          {t.label}
          {t.badge !== undefined && t.badge !== 0 && (
            <span className="ml-1.5 rounded-full bg-border px-1.5 py-px text-[10px] tabular-nums text-foreground-muted">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ sortable table

export interface Column<R> {
  key: string;
  label: string;
  align?: "left" | "right";
  title?: string;
  sort?: (r: R) => number | string;
  render: (r: R) => ReactNode;
  className?: string;
}

export function SortTable<R>({
  columns,
  rows,
  rowKey,
  initialSort,
  onRowClick,
  activeKey,
  empty = "Nothing matches these filters.",
  pageSize,
  footer,
  minWidth = 760,
}: {
  columns: Column<R>[];
  rows: R[];
  rowKey: (r: R) => string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  onRowClick?: (r: R) => void;
  activeKey?: string | null;
  empty?: string;
  pageSize?: number;
  footer?: ReactNode;
  minWidth?: number;
}) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!col?.sort || !sort) return rows;
    const f = col.sort;
    return [...rows].sort((a, b) => {
      const x = f(a);
      const y = f(b);
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);
  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pages - 1);
  const visible = pageSize ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize) : sorted;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-border bg-background-raised">
              {columns.map((c) => {
                const on = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    title={c.title}
                    aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-foreground-subtle first:pl-4 last:pr-4",
                      c.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {c.sort ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSort(on ? { key: c.key, dir: sort!.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "desc" })
                        }
                        className={cn("focus-ring rounded-sm uppercase tracking-wider hover:text-foreground", on && "text-foreground")}
                      >
                        {c.label}
                        <span aria-hidden className="ml-1">
                          {on ? (sort!.dir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const k = rowKey(r);
              return (
                <tr
                  key={k}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-background-raised/70",
                    activeKey === k && "bg-accent/5"
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2.5 first:pl-4 last:pr-4",
                        c.align === "right" && "text-right tabular-nums",
                        c.className
                      )}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-foreground-muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
          {footer}
        </table>
      </div>
      {pageSize && pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-foreground-muted">
          <span>
            {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}
          </span>
          <span className="flex gap-1">
            <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="focus-ring rounded-sm border border-border px-2 py-1 disabled:opacity-40">
              ‹ Prev
            </button>
            <button type="button" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} className="focus-ring rounded-sm border border-border px-2 py-1 disabled:opacity-40">
              Next ›
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ small bits

export function Avatar({ rep, size = 8 }: { rep: Rep; size?: 8 | 10 | 12 }) {
  const initials =
    rep.key === "team"
      ? "SX"
      : rep.name
          .split(/\s+/)
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === 8 && "h-8 w-8 text-[11px]",
        size === 10 && "h-10 w-10 text-xs",
        size === 12 && "h-12 w-12 text-sm",
        rep.key === "team" ? "bg-border text-foreground-muted" : "bg-accent/15 text-accent"
      )}
    >
      {initials}
    </span>
  );
}

export function RepBadge({ status }: { status: Rep["status"] }) {
  if (status === "active") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-px text-[10px] font-medium uppercase tracking-wider",
        status === "left" ? "bg-red-400/10 text-red-300" : "bg-border text-foreground-muted"
      )}
    >
      {status === "left" ? "✕ Left" : "Team"}
    </span>
  );
}

export function Card({ title, subtitle, children, actions, className }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-background-raised p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-foreground-subtle">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">{children}</p>;
}

export const buttonClass =
  "focus-ring rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-50";
