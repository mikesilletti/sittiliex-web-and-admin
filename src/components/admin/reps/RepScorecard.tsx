"use client";

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CLOSED_RATE,
  MILESTONES,
  PACKAGE_RATE,
  STAGE_GROUPS,
  STALE_DAYS,
  ghlContactUrl,
  type CommissionLine,
  type Lead,
  type Rep,
  type Scorecard,
} from "@/lib/reps/shared";

const REFRESH_MS = 60_000;
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const monthLong = (m: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${m}-15T12:00:00Z`)
  );
const monthShort = (m: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${m}-15T12:00:00Z`));
const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

function prevMonth(m: string) {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 2, 15));
  return d.toISOString().slice(0, 7);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function downloadCsv(filename: string, rows: string[][]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------ numbers

interface RepStats {
  rep: Rep;
  leads: Lead[];
  inbound: number;
  selfSourced: number;
  packages: CommissionLine[];
  closed: CommissionLine[];
  earned: number;
  payable: number;
  withheld: number;
  reached: Record<string, number>;
  open: Lead[];
  stale: Lead[];
}

function statsFor(rep: Rep, inPeriod: (month: string) => boolean, milestoneIdx: Record<string, number>): RepStats {
  const leads = rep.leads.filter((l) => inPeriod(l.createdMonth));
  const lines = rep.commission.filter((c) => inPeriod(c.month));
  const packages = lines.filter((c) => c.kind === "package");
  const closed = lines.filter((c) => c.kind === "closed");
  const pkgSum = packages.reduce((s, c) => s + c.amount, 0);
  const closedSum = closed.reduce((s, c) => s + c.amount, 0);
  // Owner's rule: a rep who has left isn't paid the $5,000.
  const payable = rep.status === "team" ? 0 : pkgSum + (rep.status === "active" ? closedSum : 0);
  const reached: Record<string, number> = {};
  for (const m of MILESTONES) {
    reached[m.key] = leads.filter((l) =>
      l.status === "won" ? true : l.status === "open" ? l.stageIndex >= milestoneIdx[m.key] : false
    ).length;
  }
  const open = rep.leads.filter((l) => l.status === "open");
  return {
    rep,
    leads,
    inbound: leads.filter((l) => !l.selfSourced).length,
    selfSourced: leads.filter((l) => l.selfSourced).length,
    packages,
    closed,
    earned: pkgSum + closedSum,
    payable,
    withheld: rep.status === "left" ? closedSum : 0,
    reached,
    open,
    stale: open.filter((l) => l.daysSinceMove >= STALE_DAYS && l.group !== "team"),
  };
}

// ------------------------------------------------------------------ live

function useLiveRefresh(generatedAt: string) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") startTransition(() => router.refresh());
    };
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
  const label = age < 10 ? "just now" : age < 60 ? `${age}s ago` : `${Math.floor(age / 60)}m ago`;
  return { pending, label, refresh: () => startTransition(() => router.refresh()) };
}

// ------------------------------------------------------------------ view

export function RepScorecard({ data }: { data: Scorecard }) {
  const live = useLiveRefresh(data.generatedAt);
  const [period, setPeriod] = useState<string>(data.currentMonth); // YYYY-MM or "all"
  const [openRep, setOpenRep] = useState<string | null>(null);

  const milestoneIdx = useMemo(
    () => Object.fromEntries(MILESTONES.map((m) => [m.key, data.stageNames.indexOf(m.from)])),
    [data.stageNames]
  );
  const lastMonth = prevMonth(data.currentMonth);
  const olderMonths = data.months.filter((m) => m !== data.currentMonth && m !== lastMonth);

  const stats = useMemo(() => {
    const inPeriod = (m: string) => period === "all" || m === period;
    return data.reps.map((r) => statsFor(r, inPeriod, milestoneIdx));
  }, [data.reps, period, milestoneIdx]);

  const prevStats = useMemo(() => {
    if (period === "all") return null;
    const p = prevMonth(period);
    return data.reps.map((r) => statsFor(r, (m) => m === p, milestoneIdx));
  }, [data.reps, period, milestoneIdx]);

  const sum = (xs: RepStats[] | null, f: (s: RepStats) => number) => (xs ? xs.reduce((t, s) => t + f(s), 0) : null);
  const totals = {
    payable: sum(stats, (s) => s.payable)!,
    packages: sum(stats, (s) => s.packages.length)!,
    closed: sum(stats, (s) => s.closed.length)!,
    leads: sum(stats, (s) => s.leads.length)!,
    selfSourced: sum(stats, (s) => s.selfSourced)!,
  };
  const prevTotals = {
    payable: sum(prevStats, (s) => s.payable),
    packages: sum(prevStats, (s) => s.packages.length),
    closed: sum(prevStats, (s) => s.closed.length),
    leads: sum(prevStats, (s) => s.leads.length),
  };

  const ranked = [...stats].sort(
    (a, b) =>
      Number(a.rep.status === "team") - Number(b.rep.status === "team") ||
      b.payable - a.payable ||
      b.packages.length - a.packages.length ||
      b.leads.length - a.leads.length ||
      a.rep.name.localeCompare(b.rep.name)
  );
  const hasReps = data.reps.some((r) => r.status !== "team");
  const periodLabel = period === "all" ? "all time" : monthLong(period);
  const vsLabel = period === "all" ? "" : `vs ${monthShort(prevMonth(period))}`;

  const allStale = stats
    .flatMap((s) => s.stale.map((l) => ({ lead: l, rep: s.rep })))
    .sort((a, b) => b.lead.daysSinceMove - a.lead.daysSinceMove);

  function exportCsv() {
    const rows = [["Month", "Rep", "Rep email", "Rep status", "Type", "Amount", "Payable", "Lead", "Company", "Date"]];
    for (const s of ranked) {
      for (const c of [...s.packages, ...s.closed].sort((a, b) => (a.at < b.at ? -1 : 1))) {
        const payable = s.rep.status === "team" ? "no (team)" : s.rep.status === "left" && c.kind === "closed" ? "no (left)" : "yes";
        rows.push([
          c.month,
          s.rep.name,
          s.rep.email ?? "",
          s.rep.status,
          c.kind === "package" ? "Financial package" : "Closed deal",
          String(c.amount),
          payable,
          c.lead,
          c.company,
          new Date(c.at).toISOString().slice(0, 10),
        ]);
      }
    }
    downloadCsv(`sillettix-rep-commission-${period === "all" ? "all-time" : period}.csv`, rows);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* ---------------------------------------------------------- header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-heading text-foreground">Rep Scorecard</h1>
          <p className="mt-1 text-body-sm text-foreground-muted">
            Who brought in what, straight from GoHighLevel. {money(PACKAGE_RATE)} per financial package,{" "}
            {money(CLOSED_RATE)} per closed deal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-foreground-muted" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live · updated {live.pending ? "now…" : live.label}
          </span>
          <button
            type="button"
            onClick={live.refresh}
            disabled={live.pending}
            className="focus-ring rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {data.warnings.map((w) => (
        <p key={w} className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/5 px-4 py-2 text-xs text-amber-300">
          {w}
        </p>
      ))}

      {/* ---------------------------------------------------------- period */}
      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Period">
        {[
          { v: data.currentMonth, l: "This month" },
          { v: lastMonth, l: "Last month" },
          { v: "all", l: "All time" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={period === o.v}
            onClick={() => setPeriod(o.v)}
            className={cn(
              "focus-ring rounded-sm border px-3 py-1.5 text-sm transition-colors",
              period === o.v
                ? "border-accent/60 bg-accent/10 text-foreground"
                : "border-border text-foreground-muted hover:text-foreground"
            )}
          >
            {o.l}
          </button>
        ))}
        {olderMonths.length > 0 && (
          <select
            aria-label="Earlier month"
            value={olderMonths.includes(period) ? period : ""}
            onChange={(e) => e.target.value && setPeriod(e.target.value)}
            className="focus-ring rounded-sm border border-border bg-background px-2 py-1.5 text-sm text-foreground-muted"
          >
            <option value="">Earlier…</option>
            {olderMonths.map((m) => (
              <option key={m} value={m}>
                {monthLong(m)}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-xs text-foreground-subtle">Showing {periodLabel}</span>
      </div>

      {/* ---------------------------------------------------------- KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Commission owed" value={money(totals.payable)} prev={prevTotals.payable} current={totals.payable} vs={vsLabel} accent money />
        <Kpi label="Financial packages" value={String(totals.packages)} prev={prevTotals.packages} current={totals.packages} vs={vsLabel} />
        <Kpi label="Deals closed" value={String(totals.closed)} prev={prevTotals.closed} current={totals.closed} vs={vsLabel} />
        <Kpi
          label="New leads"
          value={String(totals.leads)}
          prev={prevTotals.leads}
          current={totals.leads}
          vs={vsLabel}
          note={totals.selfSourced ? `${totals.selfSourced} self-sourced` : undefined}
        />
      </div>

      {!hasReps && (
        <p className="mt-4 rounded-md border border-dashed border-border px-4 py-4 text-sm text-foreground-muted">
          No reps yet, so every lead is with the SillettiX team. Add reps in GoHighLevel (Settings → My Staff,
          role <span className="text-foreground">User</span>) and they appear here automatically.
        </p>
      )}

      {/* ---------------------------------------------------------- leaderboard */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-lg text-foreground">Leaderboard</h2>
          <button
            type="button"
            onClick={exportCsv}
            className="focus-ring rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground-muted hover:border-accent/40 hover:text-foreground"
          >
            ⤓ Payout CSV ({periodLabel})
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-background-raised text-left text-[11px] uppercase tracking-wider text-foreground-subtle">
                <th className="px-4 py-2.5 font-medium">Rep</th>
                <th className="px-3 py-2.5 text-right font-medium">Leads</th>
                <th className="px-3 py-2.5 font-medium">Got to discovery</th>
                <th className="px-3 py-2.5 text-right font-medium">Financials</th>
                <th className="px-3 py-2.5 text-right font-medium">Closed</th>
                <th className="px-3 py-2.5 text-right font-medium">Open now</th>
                <th className="px-4 py-2.5 text-right font-medium">Owed</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => {
                const isOpen = openRep === s.rep.key;
                const discoveryPct = s.leads.length ? Math.round((s.reached.discovery / s.leads.length) * 100) : 0;
                const team = s.rep.status === "team";
                return (
                  <Fragment key={s.rep.key}>
                    <tr
                      className={cn(
                        "border-b border-border transition-colors last:border-0",
                        isOpen ? "bg-background-raised" : "hover:bg-background-raised/60",
                        team && "text-foreground-muted"
                      )}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenRep(isOpen ? null : s.rep.key)}
                          className="focus-ring flex items-center gap-3 rounded-sm text-left"
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                              team ? "bg-border text-foreground-muted" : "bg-accent/15 text-accent"
                            )}
                          >
                            {team ? "SX" : initials(s.rep.name)}
                          </span>
                          <span className="flex flex-col">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              {!team && s.payable > 0 && i < 3 && <span aria-hidden>{["🥇", "🥈", "🥉"][i]}</span>}
                              {s.rep.name}
                              <StatusChip status={s.rep.status} />
                            </span>
                            <span className="text-[11px] text-foreground-subtle">
                              {isOpen ? "Hide details ▴" : "Details ▾"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {s.leads.length}
                        {s.selfSourced > 0 && (
                          <span className="block text-[11px] text-foreground-subtle">{s.selfSourced} self-sourced</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                            <div className="h-full rounded-full bg-accent" style={{ width: `${discoveryPct}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-foreground-muted">
                            {s.leads.length ? `${discoveryPct}%` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{s.packages.length}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{s.closed.length}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {s.open.length}
                        {s.stale.length > 0 && (
                          <span className="block text-[11px] text-amber-400">{s.stale.length} quiet {STALE_DAYS}d+</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {team ? (
                          <span className="text-foreground-subtle">house</span>
                        ) : (
                          <>
                            <span className={cn("font-semibold", s.payable ? "text-emerald-400" : "text-foreground")}>
                              {money(s.payable)}
                            </span>
                            {s.withheld > 0 && (
                              <span className="block text-[11px] text-red-400 line-through">{money(s.withheld)}</span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-border bg-background-raised">
                        <td colSpan={7} className="px-4 pb-5 pt-1">
                          <RepDetail s={s} locationId={data.locationId} periodLabel={periodLabel} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------- pipeline now */}
      <section className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="rounded-md border border-border bg-background-raised p-4 lg:col-span-3">
          <h2 className="font-heading text-lg text-foreground">Open deals right now</h2>
          <p className="mt-0.5 text-xs text-foreground-subtle">Every open deal, by who gets credit for it.</p>
          <PipelineBars stats={ranked} />
        </div>
        <div className="rounded-md border border-border bg-background-raised p-4 lg:col-span-2">
          <h2 className="font-heading text-lg text-foreground">Gone quiet</h2>
          <p className="mt-0.5 text-xs text-foreground-subtle">
            Open deals with no stage move in {STALE_DAYS}+ days, before the team handoff.
          </p>
          {allStale.length === 0 ? (
            <p className="mt-4 text-sm text-foreground-muted">Nothing stuck. Every deal moved in the last {STALE_DAYS} days.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {allStale.slice(0, 8).map(({ lead, rep }) => (
                <li key={lead.contactId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <a
                      href={ghlContactUrl(data.locationId, lead.contactId)}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring block truncate rounded-sm text-foreground hover:text-accent"
                    >
                      {lead.company || lead.lead}
                    </a>
                    <span className="block truncate text-[11px] text-foreground-subtle">
                      {rep.name} · {lead.stage}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-sm bg-amber-400/10 px-2 py-0.5 text-xs tabular-nums text-amber-300">
                    {lead.daysSinceMove}d
                  </span>
                </li>
              ))}
              {allStale.length > 8 && (
                <li className="py-2 text-xs text-foreground-subtle">+{allStale.length - 8} more</li>
              )}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-foreground-subtle">
        {money(PACKAGE_RATE)} is logged when the SillettiX team moves a deal to Financials Received; {money(CLOSED_RATE)}{" "}
        when it reaches Closed Won. Both go to the deal&apos;s credited rep, even after the handoff, and only once per
        deal. A rep marked <span className="text-red-400">left</span> is no longer a GoHighLevel user, so their{" "}
        {money(CLOSED_RATE)}s are not payable. Updates every minute while this page is open.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ pieces

function Kpi({
  label,
  value,
  prev,
  current,
  vs,
  note,
  accent,
  money: isMoney,
}: {
  label: string;
  value: string;
  prev: number | null;
  current: number;
  vs: string;
  note?: string;
  accent?: boolean;
  money?: boolean;
}) {
  const delta = prev === null ? null : current - prev;
  return (
    <div className={cn("rounded-md border bg-background-raised p-4", accent ? "border-accent/40" : "border-border")}>
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", accent ? "text-accent" : "text-foreground")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-foreground-subtle">
        {delta !== null && delta !== 0 && (
          <span className={delta > 0 ? "text-emerald-400" : "text-red-400"}>
            {delta > 0 ? "▲" : "▼"} {isMoney ? money(Math.abs(delta)) : Math.abs(delta)}{" "}
          </span>
        )}
        {delta === 0 && vs && <span>no change </span>}
        {vs}
        {note && <span className="block">{note}</span>}
      </p>
    </div>
  );
}

function StatusChip({ status }: { status: Rep["status"] }) {
  if (status === "active") return null;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-px text-[10px] font-medium uppercase tracking-wider",
        status === "left" ? "bg-red-400/10 text-red-400" : "bg-border text-foreground-muted"
      )}
    >
      {status === "left" ? "left" : "team"}
    </span>
  );
}

function RepDetail({ s, locationId, periodLabel }: { s: RepStats; locationId: string; periodLabel: string }) {
  const lines = [...s.packages, ...s.closed].sort((a, b) => (a.at < b.at ? 1 : -1));
  const max = Math.max(1, s.leads.length);
  return (
    <div className="grid grid-cols-1 gap-6 pt-3 lg:grid-cols-3">
      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
          Brought in · {periodLabel}
        </h3>
        {lines.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">No financial packages or closed deals yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {lines.map((c) => (
              <li key={`${c.contactId}-${c.kind}`} className="flex items-baseline justify-between gap-3 text-sm">
                <a
                  href={ghlContactUrl(locationId, c.contactId)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring min-w-0 truncate rounded-sm text-foreground hover:text-accent"
                  title={c.lead}
                >
                  {c.company || c.lead}
                </a>
                <span className="shrink-0 text-xs tabular-nums text-foreground-subtle">
                  {dayFmt.format(new Date(c.at))} ·{" "}
                  <span className={c.kind === "closed" ? "text-emerald-400" : "text-foreground-muted"}>
                    {money(c.amount)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
          How far their {s.leads.length} lead{s.leads.length === 1 ? "" : "s"} got
        </h3>
        <ul className="mt-2 flex flex-col gap-1.5">
          {MILESTONES.map((m) => (
            <li key={m.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-xs">
              <span className="text-foreground-muted">{m.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-border">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${(s.reached[m.key] / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums text-foreground">{s.reached[m.key]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-foreground-subtle">Lost deals count as leads only.</p>
      </div>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
          Open deals now ({s.open.length})
        </h3>
        {s.open.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">None.</p>
        ) : (
          <ul className="mt-2 flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
            {[...s.open]
              .sort((a, b) => b.stageIndex - a.stageIndex || b.daysSinceMove - a.daysSinceMove)
              .map((l) => (
                <li key={l.contactId} className="flex items-baseline justify-between gap-3 text-sm">
                  <a
                    href={ghlContactUrl(locationId, l.contactId)}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring min-w-0 truncate rounded-sm text-foreground hover:text-accent"
                    title={l.lead}
                  >
                    {l.company || l.lead}
                  </a>
                  <span className="shrink-0 text-xs text-foreground-subtle">
                    {l.stage}
                    <span
                      className={cn(
                        "ml-1.5 tabular-nums",
                        l.daysSinceMove >= STALE_DAYS && l.group !== "team" ? "text-amber-400" : ""
                      )}
                    >
                      {l.daysSinceMove}d
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const GROUP_SHADES = ["bg-accent", "bg-accent/70", "bg-accent/45", "bg-accent/25"];

function PipelineBars({ stats }: { stats: RepStats[] }) {
  const rows = stats.filter((s) => s.open.length > 0);
  const max = Math.max(1, ...rows.map((s) => s.open.length));
  if (rows.length === 0) return <p className="mt-4 text-sm text-foreground-muted">No open deals.</p>;
  return (
    <div className="mt-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground-muted">
        {STAGE_GROUPS.map((g, i) => (
          <li key={g.key} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-sm", GROUP_SHADES[i])} />
            {g.label}
          </li>
        ))}
      </ul>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((s) => (
          <li key={s.rep.key} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-xs">
            <span className="truncate text-foreground-muted" title={s.rep.name}>
              {s.rep.name}
            </span>
            <span className="flex h-3 overflow-hidden rounded-sm bg-border/60" style={{ width: `${(s.open.length / max) * 100}%` }}>
              {STAGE_GROUPS.map((g, i) => {
                const n = s.open.filter((l) => l.group === g.key).length;
                return n ? (
                  <span
                    key={g.key}
                    className={cn("h-full", GROUP_SHADES[i])}
                    style={{ width: `${(n / s.open.length) * 100}%` }}
                    title={`${g.label}: ${n}`}
                  />
                ) : null;
              })}
            </span>
            <span className="text-right tabular-nums text-foreground">{s.open.length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
