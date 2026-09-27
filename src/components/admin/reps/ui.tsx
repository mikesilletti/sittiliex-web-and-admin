"use client";

import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rep } from "@/lib/reps/shared";
import { RANGES, periodOf, type RangeKey } from "./model";

// ------------------------------------------------------------------ buttons

const BUTTON_BASE =
  "focus-ring inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";
const BUTTON_VARIANTS = {
  default: "border-border-strong bg-background-raised text-foreground-muted hover:border-accent/40 hover:bg-background-overlay hover:text-foreground",
  primary: "border-accent bg-accent text-background hover:bg-accent-hover hover:border-accent-hover",
  ghost: "border-transparent text-foreground-muted hover:bg-background-raised hover:text-foreground",
  active: "border-accent/60 bg-accent/10 text-foreground",
};

export const buttonClass = cn(BUTTON_BASE, BUTTON_VARIANTS.default);

export function Button({
  variant = "default",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_VARIANTS }) {
  return <button type="button" {...props} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)} />;
}

/** A row of mutually exclusive options in one bordered pill. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-0.5 rounded-md border border-border bg-background-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-ring h-7 rounded-[5px] px-3 text-xs font-medium transition-colors",
            value === o.value ? "bg-accent/15 text-foreground shadow-[inset_0_0_0_1px_rgba(26,180,255,0.45)]" : "text-foreground-muted hover:bg-background-overlay hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ popover

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref, trigger };
}

const POPOVER = "absolute left-0 z-30 mt-1.5 rounded-lg border border-border-strong bg-background-overlay shadow-2xl shadow-black/60";

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
        checked ? "border-accent bg-accent text-background" : "border-border-strong bg-background"
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

// ------------------------------------------------------------------ date range

const rangeFmt = (a: Date, b: Date) => {
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();
  const left = a.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const right = sameMonth
    ? b.toLocaleDateString("en-US", { day: "numeric", year: sameYear && b.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })
    : b.toLocaleDateString("en-US", { month: "short", day: "numeric", year: sameYear && b.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
  return `${left} – ${right}`;
};

function presetDates(key: RangeKey): string {
  const p = periodOf({ range: key, from: "", to: "", q: "", sel: {} as never });
  if (p.start === null || p.end === null) return "Every lead";
  return rangeFmt(new Date(p.start), new Date(p.end - 86_400_000));
}

export function RangePicker({
  range,
  from,
  to,
  onChange,
}: {
  range: RangeKey;
  from: string;
  to: string;
  onChange: (range: RangeKey, from: string, to: string) => void;
}) {
  const { open, setOpen, ref, trigger } = usePopover();
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const today = new Date().toISOString().slice(0, 10);
  const validCustom = !!draftFrom && !!draftTo && draftFrom <= draftTo;
  const current = RANGES.find((r) => r.key === range)!;
  const label =
    range === "custom" && from && to
      ? rangeFmt(new Date(`${from}T00:00:00`), new Date(`${to}T00:00:00`))
      : current.label;

  return (
    <div ref={ref} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setDraftFrom(from);
          setDraftTo(to);
          setOpen((o) => !o);
        }}
        className={cn(BUTTON_BASE, BUTTON_VARIANTS.active, "pl-2.5")}
      >
        <CalendarDays className="h-3.5 w-3.5 text-accent" aria-hidden />
        <span>{label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-foreground-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="dialog" aria-label="Date range" className={cn(POPOVER, "w-72 p-1.5")}>
          <ul role="listbox" aria-label="Preset ranges">
            {RANGES.filter((r) => r.key !== "custom").map((r) => {
              const on = range === r.key;
              return (
                <li key={r.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(r.key, "", "");
                      setOpen(false);
                    }}
                    className="focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs hover:bg-background-raised"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-accent">
                      {on && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className={cn("flex-1", on ? "font-semibold text-foreground" : "text-foreground")}>{r.label}</span>
                    <span className="text-[11px] tabular-nums text-foreground-subtle">{presetDates(r.key)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1.5 border-t border-border px-2.5 pb-1.5 pt-3">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
              Custom range
              {range === "custom" && <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} aria-hidden />}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: "range-from", label: "From", value: draftFrom, set: setDraftFrom, max: draftTo || today },
                { id: "range-to", label: "To", value: draftTo, set: setDraftTo, min: draftFrom, max: undefined },
              ].map((f) => (
                <label key={f.id} htmlFor={f.id} className="flex flex-col gap-1 text-[11px] text-foreground-muted">
                  {f.label}
                  <input
                    id={f.id}
                    type="date"
                    value={f.value}
                    min={f.min}
                    max={f.max}
                    onChange={(e) => f.set(e.target.value)}
                    className="focus-ring h-8 w-full rounded-md border border-border-strong bg-background px-2 text-xs text-foreground [color-scheme:dark]"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!validCustom}
                onClick={() => {
                  onChange("custom", draftFrom, draftTo);
                  setOpen(false);
                }}
              >
                Apply range
              </Button>
            </div>
          </div>
        </div>
      )}
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
  const { open, setOpen, ref, trigger } = usePopover();
  const [q, setQ] = useState("");
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : `${selected.length} selected`;
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={cn(BUTTON_BASE, selected.length ? BUTTON_VARIANTS.active : BUTTON_VARIANTS.default, "px-2.5 font-normal")}
      >
        <span className="text-foreground-subtle">{label}</span>
        <span className={cn("max-w-[8.5rem] truncate", selected.length ? "font-medium text-foreground" : "text-foreground-muted")}>{summary}</span>
        {selected.length > 1 && (
          <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-4 text-background">{selected.length}</span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-foreground-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className={cn(POPOVER, "w-72")}>
          {options.length > 6 && (
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle" aria-hidden />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}…`}
                  aria-label={`Search ${label}`}
                  className="focus-ring h-8 w-full rounded-md border border-border-strong bg-background pl-8 pr-2 text-xs text-foreground placeholder:text-foreground-subtle"
                />
              </div>
            </div>
          )}
          <ul role="listbox" aria-multiselectable aria-label={label} className="max-h-72 overflow-y-auto p-1.5">
            {shown.map((o) => {
              const on = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(o.value)}
                    className="focus-ring group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-background-raised"
                  >
                    <Checkbox checked={on} />
                    <span className={cn("flex-1 truncate", on ? "font-medium text-foreground" : "text-foreground")}>{o.label}</span>
                    <span
                      role="presentation"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange([o.value]);
                      }}
                      className="hidden rounded px-1.5 text-[10px] font-medium text-accent hover:bg-accent/10 group-hover:inline"
                    >
                      Only
                    </span>
                    <span className="min-w-[1.5rem] text-right tabular-nums text-foreground-subtle">{o.count}</span>
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-2 py-3 text-center text-xs text-foreground-subtle">No matches</li>}
          </ul>
          <div className="flex items-center justify-between gap-2 border-t border-border p-2">
            <Button variant="ghost" disabled={!selected.length} onClick={() => onChange([])}>
              Clear
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ search

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="focus-ring h-8 w-56 rounded-md border border-border-strong bg-background-raised pl-8 pr-8 text-xs text-foreground placeholder:text-foreground-subtle hover:border-accent/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="focus-ring absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-foreground-subtle hover:bg-background-overlay hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Chip({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border-strong bg-background-raised pl-2.5 pr-1 text-[11px] text-foreground-muted">
      <span className="text-foreground-subtle">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}: ${value}`}
        className="focus-ring ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-foreground-subtle hover:bg-background-overlay hover:text-foreground"
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}

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
    <div className={cn("rounded-lg border bg-background-raised p-4", hero ? "border-accent/40" : "border-border")}>
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
            "focus-ring -mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active === t.key ? "border-accent text-foreground" : "border-transparent text-foreground-muted hover:border-border-strong hover:text-foreground"
          )}
        >
          {t.label}
          {t.badge !== undefined && t.badge !== 0 && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-px text-[10px] tabular-nums",
                active === t.key ? "bg-accent/15 text-accent" : "bg-border text-foreground-muted"
              )}
            >
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
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-border bg-background-raised">
              {columns.map((c) => {
                const on = sort?.key === c.key;
                const Icon = on ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
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
                        onClick={() => setSort(on ? { key: c.key, dir: sort!.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "desc" })}
                        className={cn(
                          "focus-ring group inline-flex items-center gap-1 rounded-sm uppercase tracking-wider hover:text-foreground",
                          c.align === "right" && "flex-row-reverse",
                          on && "text-foreground"
                        )}
                      >
                        {c.label}
                        <Icon className={cn("h-3 w-3", on ? "text-accent" : "opacity-40 group-hover:opacity-100")} aria-hidden />
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
                    "border-b border-border transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-background-raised/70",
                    activeKey === k && "bg-accent/5"
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-3 py-2.5 first:pl-4 last:pr-4", c.align === "right" && "text-right tabular-nums", c.className)}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-foreground-muted">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
          {footer}
        </table>
      </div>
      {pageSize && pages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-background-raised/50 px-4 py-2 text-xs text-foreground-muted">
          <span className="tabular-nums">
            {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}
          </span>
          <span className="flex gap-1.5">
            <Button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page">
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Prev
            </Button>
            <Button disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page">
              Next <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
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
      {status === "left" ? <><X className="h-2.5 w-2.5" aria-hidden /> Left</> : "Team"}
    </span>
  );
}

export function Card({
  title,
  subtitle,
  children,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-background-raised p-4", className)}>
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
  return <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">{children}</p>;
}

// ------------------------------------------------------------------ dialog

export function Dialog({
  title,
  children,
  onClose,
  actions,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md rounded-xl border border-border-strong bg-background-overlay p-5 shadow-2xl shadow-black/70">
        <h2 className="font-heading text-lg text-foreground">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-foreground-muted">{children}</div>
        <div className="mt-5 flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ toasts

export interface Toast {
  id: number;
  tone: "success" | "error" | "info";
  text: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, dismiss };
}

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-background-overlay px-3.5 py-3 text-sm shadow-2xl shadow-black/60",
            t.tone === "success" ? "border-emerald-400/40" : t.tone === "error" ? "border-red-400/50" : "border-border-strong"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              t.tone === "success" ? "bg-emerald-400 text-background" : t.tone === "error" ? "bg-red-400 text-background" : "bg-accent text-background"
            )}
          >
            {t.tone === "success" ? "✓" : t.tone === "error" ? "!" : "i"}
          </span>
          <span className="flex-1 text-foreground">{t.text}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="focus-ring rounded text-foreground-subtle hover:text-foreground">
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ column menu

export function ColumnMenu({
  columns,
  visible,
  onChange,
}: {
  columns: { key: string; label: string }[];
  visible: string[];
  onChange: (next: string[]) => void;
}) {
  const { open, setOpen, ref, trigger } = usePopover();
  return (
    <div ref={ref} className="relative">
      <button ref={trigger} type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(BUTTON_BASE, BUTTON_VARIANTS.default)}>
        Columns
        <span className="rounded-full bg-border px-1.5 text-[10px] tabular-nums text-foreground-muted">{visible.length}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-foreground-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className={cn(POPOVER, "left-auto right-0 w-56 p-1.5")}>
          {columns.map((c) => {
            const on = visible.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                onClick={() => onChange(on ? visible.filter((v) => v !== c.key) : [...visible, c.key])}
                className="focus-ring flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs text-foreground hover:bg-background-raised"
              >
                <Checkbox checked={on} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ menu button

export function MenuButton({
  label,
  items,
  onSelect,
  icon,
}: {
  label: string;
  items: { value: string; label: string; hint?: string; current?: boolean }[];
  onSelect: (value: string) => void;
  icon?: ReactNode;
}) {
  const { open, setOpen, ref, trigger } = usePopover();
  return (
    <div ref={ref} className="relative">
      <button ref={trigger} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(BUTTON_BASE, BUTTON_VARIANTS.default)}>
        {icon}
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 text-foreground-subtle transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className={cn(POPOVER, "max-h-80 w-72 overflow-y-auto p-1.5")}>
          {items.map((it) => (
            <button
              key={it.value}
              type="button"
              role="menuitem"
              disabled={it.current}
              onClick={() => {
                setOpen(false);
                onSelect(it.value);
              }}
              className="focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-background-raised disabled:cursor-default disabled:opacity-100"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center text-accent">
                {it.current && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
              </span>
              <span className={cn("flex-1", it.current && "font-semibold")}>{it.label}</span>
              {it.hint && <span className="text-[10px] text-foreground-subtle">{it.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
