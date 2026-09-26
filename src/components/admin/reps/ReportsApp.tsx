"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CLOSED_RATE, PACKAGE_RATE, type ReportData, type Rep } from "@/lib/reps/shared";
import {
  DEFAULT_FILTERS,
  DIMENSIONS,
  RANGES,
  dimensionOptions,
  emptySel,
  filtersToQuery,
  matchDeals,
  milestoneIndex,
  moneyFull,
  periodOf,
  scopeOf,
  statsOf,
  type DimKey,
  type Filters,
  type RangeKey,
} from "./model";
import { MultiSelect, Tabs, buttonClass } from "./ui";
import { CallsView, CommissionView, DealsView, Overview, RepProfile, RepsView, SourcingView, type Ctx } from "./views";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "reps", label: "Reps" },
  { key: "sourcing", label: "Sourcing" },
  { key: "deals", label: "Deals" },
  { key: "commission", label: "Commission" },
  { key: "calls", label: "Calls" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const REFRESH_MS = 60_000;

function useLive(generatedAt: string) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && start(() => router.refresh());
    const poll = setInterval(refresh, REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 5_000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - new Date(generatedAt).getTime() > 30_000) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, generatedAt]);
  const age = Math.max(0, Math.round((now - new Date(generatedAt).getTime()) / 1000));
  return {
    pending,
    now,
    label: age < 10 ? "just now" : age < 60 ? `${age}s ago` : `${Math.floor(age / 60)}m ago`,
    refresh: () => start(() => router.refresh()),
  };
}

export function ReportsApp({ data, initial, initialTab }: { data: ReportData; initial: Filters; initialTab: string }) {
  const live = useLive(data.generatedAt);
  const [filters, setFilters] = useState<Filters>(initial);
  const [tab, setTab] = useState<TabKey>(TABS.some((t) => t.key === initialTab) ? (initialTab as TabKey) : "overview");
  const [profile, setProfile] = useState<string | null>(null);

  // Keep the URL in step so any view can be bookmarked or shared.
  useEffect(() => {
    const q = filtersToQuery(filters);
    const params = new URLSearchParams(q.slice(1));
    if (tab !== "overview") params.set("tab", tab);
    const s = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
  }, [filters, tab]);

  const repByKey = useMemo(() => new Map(data.reps.map((r) => [r.key, r])), [data.reps]);
  const rep = (key: string): Rep =>
    repByKey.get(key) ?? { key, name: key === "team" ? "SillettiX team" : key, email: key === "team" ? null : key, status: key === "team" ? "team" : "left" };

  const options = useMemo(() => dimensionOptions(data, (k) => rep(k).name), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const mIdx = useMemo(() => milestoneIndex(data.stageNames), [data.stageNames]);
  const period = useMemo(() => periodOf(filters), [filters]);
  const deals = useMemo(() => matchDeals(data, filters), [data, filters]);
  const scope = useMemo(() => scopeOf(data, deals, period.start, period.end), [data, deals, period]);
  const prevScope = useMemo(() => (period.prev ? scopeOf(data, deals, period.prev.start, period.prev.end) : null), [data, deals, period]);
  const repStatus = (k: string) => rep(k).status;
  const stats = statsOf(scope, mIdx, repStatus, live.now);
  const prevStats = prevScope ? statsOf(prevScope, mIdx, repStatus, live.now) : null;

  const ctx: Ctx = { data, period, scope, prevScope, stats, prevStats, mIdx, rep, openProfile: setProfile, now: live.now };

  const setSel = (k: DimKey, v: string[]) => setFilters((f) => ({ ...f, sel: { ...f.sel, [k]: v } }));
  const active = DIMENSIONS.flatMap((d) =>
    filters.sel[d.key].map((v) => ({ dim: d.key, label: d.label, value: v, text: options[d.key].find((o) => o.value === v)?.label ?? v }))
  );
  const hasFilters = active.length > 0 || filters.q || filters.range !== DEFAULT_FILTERS.range;
  const hasReps = data.reps.some((r) => r.status !== "team");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* ---------------------------------------------------------- header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-heading text-foreground">Rep Reports</h1>
          <p className="mt-1 text-body-sm text-foreground-muted">
            Every lead, call and commission, live from GoHighLevel. ${PACKAGE_RATE} per financial package, {moneyFull(CLOSED_RATE)} per closed deal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-foreground-muted" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live · {live.pending ? "updating…" : `updated ${live.label}`}
          </span>
          <button type="button" onClick={live.refresh} disabled={live.pending} className={buttonClass}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {data.warnings.map((w) => (
        <p key={w} className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/5 px-4 py-2 text-xs text-amber-200">
          ⚠ {w}
        </p>
      ))}
      {!hasReps && (
        <p className="mt-4 rounded-md border border-dashed border-border px-4 py-3 text-sm text-foreground-muted">
          No reps yet, so every lead shows under the SillettiX team. Add reps in GoHighLevel (Settings → My Staff, role{" "}
          <span className="text-foreground">User</span>) and they appear here automatically.
        </p>
      )}

      {/* ---------------------------------------------------------- filters */}
      <div className="sticky top-0 z-20 -mx-6 mt-6 border-y border-border bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="range">Date range</label>
          <select
            id="range"
            value={filters.range}
            onChange={(e) => setFilters((f) => ({ ...f, range: e.target.value as RangeKey }))}
            className="focus-ring rounded-sm border border-accent/60 bg-accent/10 px-2.5 py-1.5 text-xs text-foreground"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          {filters.range === "custom" && (
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <input type="date" aria-label="From" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                className="focus-ring rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground [color-scheme:dark]" />
              –
              <input type="date" aria-label="To" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                className="focus-ring rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground [color-scheme:dark]" />
            </span>
          )}
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          {DIMENSIONS.map((d) => (
            <MultiSelect key={d.key} label={d.label} options={options[d.key]} selected={filters.sel[d.key]} onChange={(v) => setSel(d.key, v)} />
          ))}
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Search company, lead…"
            aria-label="Search deals"
            className="focus-ring ml-auto w-48 rounded-sm border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-foreground-subtle"
          />
        </div>
        {(active.length > 0 || filters.q) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {active.map((a) => (
              <button
                key={`${a.dim}-${a.value}`}
                type="button"
                onClick={() => setSel(a.dim, filters.sel[a.dim].filter((v) => v !== a.value))}
                className="focus-ring inline-flex items-center gap-1 rounded-full border border-border-strong bg-background-raised px-2 py-0.5 text-[11px] text-foreground-muted hover:text-foreground"
                aria-label={`Remove ${a.label}: ${a.text}`}
              >
                <span className="text-foreground-subtle">{a.label}:</span> {a.text} <span aria-hidden>✕</span>
              </button>
            ))}
            {hasFilters && (
              <button type="button" onClick={() => setFilters({ ...DEFAULT_FILTERS, sel: emptySel() })} className="focus-ring rounded-sm px-2 text-[11px] text-accent hover:underline">
                Clear all
              </button>
            )}
          </div>
        )}
        <p className="mt-2 text-[11px] text-foreground-subtle">
          {period.label} · {deals.length} deal{deals.length === 1 ? "" : "s"} match{deals.length === 1 ? "es" : ""}
          {period.prev ? ` · compared with ${period.prev.label}` : ""}
        </p>
      </div>

      {/* ---------------------------------------------------------- tabs */}
      <div className="mt-4">
        <Tabs
          tabs={TABS.map((t) => ({
            ...t,
            badge: t.key === "deals" ? scope.cohort.length : t.key === "commission" ? scope.lines.length : t.key === "calls" ? stats.upcoming : undefined,
          }))}
          active={tab}
          onChange={setTab}
        />
      </div>
      <div className={cn("mt-5 transition-opacity", live.pending && "opacity-70")}>
        {tab === "overview" && <Overview ctx={ctx} />}
        {tab === "reps" && <RepsView ctx={ctx} />}
        {tab === "sourcing" && <SourcingView ctx={ctx} />}
        {tab === "deals" && <DealsView ctx={ctx} />}
        {tab === "commission" && <CommissionView ctx={ctx} />}
        {tab === "calls" && <CallsView ctx={ctx} />}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-foreground-subtle">
        ${PACKAGE_RATE} is logged when the SillettiX team moves a deal to Financials Received; {moneyFull(CLOSED_RATE)} when it reaches Closed Won. Both go
        to the deal&apos;s credited rep, even after the handoff, and only once per deal. A rep marked &ldquo;Left&rdquo; is no longer a GoHighLevel
        user, so their {moneyFull(CLOSED_RATE)}s are not payable. Industry and state are read from what sellers typed on the form; hover a value
        in the Deals tab to see the original. Updates every minute while open.
      </p>

      {profile && <RepProfile ctx={ctx} repKey={profile} onClose={() => setProfile(null)} />}
    </div>
  );
}
