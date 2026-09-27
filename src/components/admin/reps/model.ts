// Pure reporting logic for the Rep reports: filters, date ranges and every
// metric, computed on the client from one GHL snapshot so switching a filter
// or tab is instant.

import {
  ASKING_BANDS,
  INDUSTRY_GROUPS,
  MILESTONES,
  PROFIT_BANDS,
  REVENUE_BANDS,
  SOURCES,
  STALE_DAYS,
  TIMELINES,
  type Call,
  type CommissionLine,
  type Deal,
  type MilestoneKey,
  type ReportData,
  type Rep,
} from "@/lib/reps/shared";

// ------------------------------------------------------------------ filters

export const RANGES = [
  { key: "month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "quarter", label: "This quarter" },
  { key: "ytd", label: "Year to date" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom range" },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];

export const DIMENSIONS = [
  { key: "reps", label: "Rep", field: "repKey" },
  { key: "sources", label: "Source", field: "source" },
  { key: "industries", label: "Industry", field: "industry" },
  { key: "states", label: "State", field: "state" },
  { key: "revenue", label: "Revenue", field: "revenue" },
  { key: "profit", label: "Profit", field: "profit" },
  { key: "timeline", label: "Timeline", field: "timeline" },
  { key: "asking", label: "Asking price", field: "asking" },
  { key: "stages", label: "Stage", field: "stage" },
  { key: "statuses", label: "Status", field: "status" },
] as const;
export type DimKey = (typeof DIMENSIONS)[number]["key"];
export type DealField = (typeof DIMENSIONS)[number]["field"];

export interface Filters {
  range: RangeKey;
  from: string; // YYYY-MM-DD, custom only
  to: string;
  q: string;
  sel: Record<DimKey, string[]>;
}

export const emptySel = (): Record<DimKey, string[]> =>
  Object.fromEntries(DIMENSIONS.map((d) => [d.key, []])) as unknown as Record<DimKey, string[]>;

export const DEFAULT_FILTERS: Filters = { range: "month", from: "", to: "", q: "", sel: emptySel() };

/** Filters <-> URL query, so any view can be bookmarked or shared. */
export function filtersToQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.range !== "month") p.set("range", f.range);
  if (f.range === "custom") {
    if (f.from) p.set("from", f.from);
    if (f.to) p.set("to", f.to);
  }
  if (f.q) p.set("q", f.q);
  for (const d of DIMENSIONS) if (f.sel[d.key].length) p.set(d.key, f.sel[d.key].join("|"));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filtersFromQuery(q: Record<string, string | string[] | undefined>): Filters {
  const get = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : (q[k] as string | undefined)) ?? "";
  const range = RANGES.some((r) => r.key === get("range")) ? (get("range") as RangeKey) : "month";
  const sel = emptySel();
  for (const d of DIMENSIONS) sel[d.key] = get(d.key) ? get(d.key).split("|").filter(Boolean) : [];
  return { range, from: get("from"), to: get("to"), q: get("q"), sel };
}

export interface Period {
  start: number | null; // ms, inclusive
  end: number | null; // ms, exclusive
  label: string;
  prev: { start: number; end: number; label: string } | null;
  bucket: "week" | "month";
}

const monthName = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export function periodOf(f: Filters, now = new Date()): Period {
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = 86_400_000;
  const mk = (start: Date, end: Date, label: string, prevStart: Date, prevLabel: string): Period => ({
    start: start.getTime(),
    end: end.getTime(),
    label,
    prev: { start: prevStart.getTime(), end: start.getTime(), label: prevLabel },
    bucket: end.getTime() - start.getTime() > 120 * day ? "month" : "week",
  });
  switch (f.range) {
    case "month": {
      const s = new Date(y, m, 1);
      return mk(s, new Date(y, m + 1, 1), monthName(s), new Date(y, m - 1, 1), new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" }));
    }
    case "last-month": {
      const s = new Date(y, m - 1, 1);
      return mk(s, new Date(y, m, 1), monthName(s), new Date(y, m - 2, 1), new Date(y, m - 2, 1).toLocaleDateString("en-US", { month: "short" }));
    }
    case "30d":
    case "90d": {
      const n = f.range === "30d" ? 30 : 90;
      const end = new Date(y, m, now.getDate() + 1);
      const s = new Date(end.getTime() - n * day);
      return mk(s, end, `Last ${n} days`, new Date(s.getTime() - n * day), `prior ${n} days`);
    }
    case "quarter": {
      const q = Math.floor(m / 3) * 3;
      const s = new Date(y, q, 1);
      return mk(s, new Date(y, q + 3, 1), `Q${q / 3 + 1} ${y}`, new Date(y, q - 3, 1), "last quarter");
    }
    case "ytd": {
      const s = new Date(y, 0, 1);
      const end = new Date(y, m, now.getDate() + 1);
      return mk(s, end, `${y} to date`, new Date(y - 1, 0, 1), `${y - 1}`);
    }
    case "custom": {
      const s = f.from ? new Date(`${f.from}T00:00:00`) : null;
      const e = f.to ? new Date(new Date(`${f.to}T00:00:00`).getTime() + day) : null;
      if (!s || !e || e <= s) return { start: s?.getTime() ?? null, end: e?.getTime() ?? null, label: "Custom range", prev: null, bucket: "week" };
      const len = e.getTime() - s.getTime();
      return mk(s, e, `${shortDate(s)} – ${shortDate(new Date(e.getTime() - day))}`, new Date(s.getTime() - len), "prior period");
    }
    default:
      return { start: null, end: null, label: "All time", prev: null, bucket: "month" };
  }
}

export const inRange = (iso: string, start: number | null, end: number | null) => {
  const t = new Date(iso).getTime();
  return (start === null || t >= start) && (end === null || t < end);
};

/** Deals that match every attribute filter (the date range is applied per metric). */
export function matchDeals(data: ReportData, f: Filters): Deal[] {
  const q = f.q.trim().toLowerCase();
  return data.deals.filter((d) => {
    for (const dim of DIMENSIONS) {
      const chosen = f.sel[dim.key];
      if (chosen.length && !chosen.includes(String(d[dim.field]))) return false;
    }
    if (q && !`${d.company} ${d.lead} ${d.industryRaw} ${d.locationRaw}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Options for each filter, in a sensible order, with counts from the whole dataset. */
export function dimensionOptions(data: ReportData, repName: (k: string) => string) {
  const order: Partial<Record<DimKey, readonly string[]>> = {
    sources: SOURCES,
    industries: INDUSTRY_GROUPS,
    revenue: REVENUE_BANDS,
    profit: PROFIT_BANDS,
    timeline: TIMELINES,
    asking: ASKING_BANDS,
    stages: data.stageNames,
    statuses: ["open", "won", "lost", "abandoned"],
  };
  const out = {} as Record<DimKey, { value: string; label: string; count: number }[]>;
  for (const dim of DIMENSIONS) {
    const counts = new Map<string, number>();
    for (const d of data.deals) counts.set(String(d[dim.field]), (counts.get(String(d[dim.field])) ?? 0) + 1);
    let values: string[];
    if (dim.key === "reps") values = data.reps.map((r) => r.key);
    else if (order[dim.key]) values = [...order[dim.key]!].filter((v) => counts.has(v));
    else values = [...counts.keys()].sort((a, b) => (a === "Unknown" ? 1 : b === "Unknown" ? -1 : a.localeCompare(b)));
    for (const v of counts.keys()) if (!values.includes(v)) values.push(v);
    out[dim.key] = values.map((v) => ({
      value: v,
      label: dim.key === "reps" ? repName(v) : dim.key === "statuses" ? v[0].toUpperCase() + v.slice(1) : v,
      count: counts.get(v) ?? 0,
    }));
  }
  return out;
}

// ------------------------------------------------------------------ metrics

export interface Stats {
  leads: number;
  selfSourced: number;
  reached: Record<MilestoneKey, number>;
  lost: number;
  packages: number;
  closed: number;
  pkgSum: number;
  closedSum: number;
  payable: number;
  withheld: number;
  callsBooked: number;
  held: number;
  noShows: number;
  cancelled: number;
  upcoming: number;
  open: number;
  quiet: number;
  avgDaysToFinancials: number | null;
  lastActivity: string | null;
}

export interface Scope {
  deals: Deal[]; // attribute-filtered (all dates)
  cohort: Deal[]; // + created in the period
  lines: CommissionLine[]; // in the period, for matching deals
  calls: Call[]; // in the period, for matching deals
  dealByContact: Map<string, Deal>;
}

export function scopeOf(data: ReportData, deals: Deal[], start: number | null, end: number | null): Scope {
  const dealByContact = new Map(deals.map((d) => [d.contactId, d]));
  return {
    deals,
    cohort: deals.filter((d) => inRange(d.createdAt, start, end)),
    lines: data.commission.filter((c) => dealByContact.has(c.contactId) && inRange(c.at, start, end)),
    calls: data.calls.filter((c) => dealByContact.has(c.contactId) && inRange(c.start, start, end)),
    dealByContact,
  };
}

export function milestoneIndex(stageNames: string[]) {
  return Object.fromEntries(MILESTONES.map((m) => [m.key, stageNames.indexOf(m.from)])) as Record<MilestoneKey, number>;
}

export function reachedMilestone(d: Deal, idx: number, hadCall: boolean, key: MilestoneKey) {
  if (d.status === "won") return true;
  if (d.status !== "open") return false;
  if (key === "discovery" && hadCall) return true;
  if ((key === "contacted" || key === "reached") && hadCall) return true;
  return d.stageIndex >= idx;
}

export function statsOf(
  s: Scope,
  mIdx: Record<MilestoneKey, number>,
  repStatus: (key: string) => Rep["status"],
  now = Date.now()
): Stats {
  const withCall = new Set(s.calls.filter((c) => c.status !== "cancelled").map((c) => c.contactId));
  const reached = Object.fromEntries(
    MILESTONES.map((m) => [m.key, s.cohort.filter((d) => reachedMilestone(d, mIdx[m.key], withCall.has(d.contactId), m.key)).length])
  ) as Record<MilestoneKey, number>;
  const packages = s.lines.filter((l) => l.kind === "package");
  const closed = s.lines.filter((l) => l.kind === "closed");
  let payable = 0;
  let withheld = 0;
  for (const l of s.lines) {
    const st = repStatus(l.repKey);
    if (st === "team") continue;
    if (st === "left" && l.kind === "closed") withheld += l.amount;
    else payable += l.amount;
  }
  const days = packages
    .map((l) => {
      const d = s.dealByContact.get(l.contactId);
      return d ? (new Date(l.at).getTime() - new Date(d.createdAt).getTime()) / 86_400_000 : null;
    })
    .filter((x): x is number => x !== null && x >= 0);
  const open = s.deals.filter((d) => d.status === "open");
  const lastActivity = s.deals.reduce<string | null>(
    (best, d) => (d.lastActivityAt && (!best || d.lastActivityAt > best) ? d.lastActivityAt : best),
    null
  );
  return {
    leads: s.cohort.length,
    selfSourced: s.cohort.filter((d) => d.source === "Rep-sourced").length,
    reached,
    lost: s.cohort.filter((d) => d.status === "lost" || d.status === "abandoned").length,
    packages: packages.length,
    closed: closed.length,
    pkgSum: packages.reduce((t, l) => t + l.amount, 0),
    closedSum: closed.reduce((t, l) => t + l.amount, 0),
    payable,
    withheld,
    callsBooked: s.calls.filter((c) => c.status !== "cancelled").length,
    held: s.calls.filter((c) => c.status === "held").length,
    noShows: s.calls.filter((c) => c.status === "no-show").length,
    cancelled: s.calls.filter((c) => c.status === "cancelled").length,
    upcoming: s.calls.filter((c) => c.status === "upcoming" && new Date(c.start).getTime() > now).length,
    open: open.length,
    quiet: open.filter((d) => d.group !== "team" && isQuiet(d, now)).length,
    avgDaysToFinancials: days.length ? days.reduce((a, b) => a + b, 0) / days.length : null,
    lastActivity,
  };
}

export const daysSince = (iso: string, now = Date.now()) => Math.floor((now - new Date(iso).getTime()) / 86_400_000);
export const isQuiet = (d: Deal, now = Date.now()) => d.status === "open" && daysSince(d.lastMoveAt, now) >= STALE_DAYS;

/** Split a scope by any deal field (rep, source, industry...). */
export function splitScope(s: Scope, field: DealField): Map<string, Scope> {
  const out = new Map<string, Scope>();
  const get = (v: string) => {
    let sc = out.get(v);
    if (!sc) {
      sc = { deals: [], cohort: [], lines: [], calls: [], dealByContact: s.dealByContact };
      out.set(v, sc);
    }
    return sc;
  };
  for (const d of s.deals) get(String(d[field])).deals.push(d);
  for (const d of s.cohort) get(String(d[field])).cohort.push(d);
  // Commission and calls follow the rep they're credited to; every other
  // dimension follows the deal they belong to.
  for (const l of s.lines) get(field === "repKey" ? l.repKey : String(s.dealByContact.get(l.contactId)?.[field])).lines.push(l);
  for (const c of s.calls) get(field === "repKey" ? c.repKey : String(s.dealByContact.get(c.contactId)?.[field])).calls.push(c);
  return out;
}

// ------------------------------------------------------------------ trend

export interface Bucket {
  key: string;
  label: string;
  full: string;
  bySource: Record<string, number>;
  leads: number;
  packages: number;
  closed: number;
  held: number;
}

export function buckets(s: Scope, period: Period, data: ReportData): Bucket[] {
  const starts: Date[] = [];
  const first =
    period.start !== null
      ? new Date(period.start)
      : new Date(Math.min(...data.deals.map((d) => new Date(d.createdAt).getTime()), Date.now()));
  const last = period.end !== null ? new Date(Math.min(period.end, Date.now() + 86_400_000)) : new Date();
  if (period.bucket === "month") {
    for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d < last; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) starts.push(d);
  } else {
    const d0 = new Date(first.getFullYear(), first.getMonth(), first.getDate() - ((first.getDay() + 6) % 7));
    for (let d = d0; d < last; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)) starts.push(d);
  }
  const out: Bucket[] = starts.map((d) => ({
    key: d.toISOString(),
    label:
      period.bucket === "month"
        ? d.toLocaleDateString("en-US", { month: "short" })
        : d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
    full:
      period.bucket === "month"
        ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    bySource: {},
    leads: 0,
    packages: 0,
    closed: 0,
    held: 0,
  }));
  const idx = (iso: string) => {
    const t = new Date(iso).getTime();
    for (let i = starts.length - 1; i >= 0; i--) if (t >= starts[i].getTime()) return i;
    return -1;
  };
  for (const d of s.cohort) {
    const i = idx(d.createdAt);
    if (i < 0) continue;
    out[i].leads++;
    out[i].bySource[d.source] = (out[i].bySource[d.source] ?? 0) + 1;
  }
  for (const l of s.lines) {
    const i = idx(l.at);
    if (i >= 0) out[i][l.kind === "package" ? "packages" : "closed"]++;
  }
  for (const c of s.calls) {
    const i = idx(c.start);
    if (i >= 0 && c.status === "held") out[i].held++;
  }
  return out;
}

// ------------------------------------------------------------------ format

export const money = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: n >= 10_000_000 ? 0 : 1 })}M`
    : n >= 100_000
      ? `$${Math.round(n / 1000).toLocaleString("en-US")}k`
      : `$${n.toLocaleString("en-US")}`;
export const moneyFull = (n: number) => `$${n.toLocaleString("en-US")}`;
export const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
export const ratio = (a: number, b: number) => (b ? a / b : 0);

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------ deals workspace

/** 0–100 from the seller's own form answers: size of the prize and how soon. */
export function fitScore(d: Deal): number {
  const rev: Record<string, number> = {
    "Under $250,000": 10, "$250,000 - $500,000": 25, "$500,000 - $1 million": 35,
    "$1 million - $2 million": 40, "$2 million - $5 million": 40, "$5 million+": 40,
  };
  const profit: Record<string, number> = {
    "Under $250,000": 10, "$250,000 - $500,000": 20, "$500,000 - $1 million": 25,
    "$1 million - $2 million": 30, "$2 million - $5 million": 30, "$5 million+": 30,
  };
  const time: Record<string, number> = {
    "As soon as possible": 30, "Within 3 months": 30, "3-6 months": 20, "6-12 months": 10,
    "More than 12 months": 5, "Just exploring": 0,
  };
  return Math.min(100, (rev[d.revenue] ?? 10) + (profit[d.profit] ?? 5) + (time[d.timeline] ?? 10));
}

export type FitTier = "hot" | "warm" | "cool";
export const fitTier = (score: number): FitTier => (score >= 70 ? "hot" : score >= 45 ? "warm" : "cool");

export const SAVED_VIEWS = [
  { key: "all", label: "All deals", test: () => true },
  { key: "hot", label: "Hot leads", test: (d: Deal) => d.status === "open" && fitScore(d) >= 70 },
  { key: "quiet", label: "Gone quiet", test: (d: Deal, now: number) => isQuiet(d, now) && d.group !== "team" },
  { key: "new", label: "Not worked yet", test: (d: Deal) => d.status === "open" && d.stageIndex === 0 },
  { key: "financials", label: "Chasing financials", test: (d: Deal) => d.status === "open" && d.group === "financials" },
  { key: "team", label: "With the team", test: (d: Deal) => d.status === "open" && d.group === "team" },
  { key: "self", label: "Self-sourced", test: (d: Deal) => d.source === "Rep-sourced" },
  { key: "won", label: "Won", test: (d: Deal) => d.status === "won" },
  { key: "lost", label: "Lost", test: (d: Deal) => d.status === "lost" || d.status === "abandoned" },
] as const;
export type SavedViewKey = (typeof SAVED_VIEWS)[number]["key"];
