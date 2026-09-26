"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CLOSED_RATE, PACKAGE_RATE, type ReportData, type Rep } from "@/lib/reps/shared";
import {
  DEFAULT_FILTERS,
  DIMENSIONS,
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
} from "./model";
import { RefreshCw } from "lucide-react";
import { Button, Chip, MultiSelect, RangePicker, SearchInput, Tabs } from "./ui";
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
          <Button onClick={live.refresh} disabled={live.pending}>
            <RefreshCw className={cn("h-3.5 w-3.5", live.pending && "animate-spin")} aria-hidden />
            Refresh
          </Button>
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
          <RangePicker
            range={filters.range}
            from={filters.from}
            to={filters.to}
            onChange={(range, from, to) => setFilters((f) => ({ ...f, range, from, to }))}
          />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          {DIMENSIONS.map((d) => (
            <MultiSelect key={d.key} label={d.label} options={options[d.key]} selected={filters.sel[d.key]} onChange={(v) => setSel(d.key, v)} />
          ))}
          <div className="ml-auto">
            <SearchInput value={filters.q} onChange={(q) => setFilters((f) => ({ ...f, q }))} placeholder="Search company, lead…" />
          </div>
        </div>
        {(active.length > 0 || filters.q) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {active.map((a) => (
              <Chip
                key={`${a.dim}-${a.value}`}
                label={a.label}
                value={a.text}
                onRemove={() => setSel(a.dim, filters.sel[a.dim].filter((v) => v !== a.value))}
              />
            ))}
            {filters.q && <Chip label="Search" value={`“${filters.q}”`} onRemove={() => setFilters((f) => ({ ...f, q: "" }))} />}
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters({ ...DEFAULT_FILTERS, sel: emptySel() })}
                className="focus-ring h-6 rounded-full px-2.5 text-[11px] font-medium text-accent hover:bg-accent/10"
              >
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
