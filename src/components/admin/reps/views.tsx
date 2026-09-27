"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  MILESTONES,
  ORDINAL_RAMP,
  PACKAGE_RATE,
  CLOSED_RATE,
  SOURCES,
  SOURCE_COLORS,
  STAGE_GROUPS,
  STALE_DAYS,
  ghlContactUrl,
  type Call,
  type Deal,
  type ReportData,
  type Rep,
} from "@/lib/reps/shared";
import {
  DIMENSIONS,
  buckets,
  daysSince,
  downloadCsv,
  isQuiet,
  moneyFull,
  pct,
  ratio,
  splitScope,
  statsOf,
  type DealField,
  type Period,
  type Scope,
  type Stats,
} from "./model";
import { Funnel, HBars, Meter, StackedBars, StackedColumns } from "./charts";
import { DealsWorkspace } from "./deals";
import { Download, X } from "lucide-react";
import { Avatar, Button, Card, Empty, Kpi, RepBadge, Segmented, SortTable, type Column } from "./ui";

export interface Ctx {
  data: ReportData;
  period: Period;
  scope: Scope;
  prevScope: Scope | null;
  stats: Stats;
  prevStats: Stats | null;
  mIdx: Record<string, number>;
  rep: (key: string) => Rep;
  openProfile: (key: string) => void;
  now: number;
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDays = (n: number | null) => (n === null ? "—" : `${n < 10 ? n.toFixed(1) : Math.round(n)}d`);

function delta(a: number, b: number | null | undefined) {
  return b === null || b === undefined ? null : a - b;
}

function LeadLink({ ctx, deal, children }: { ctx: Ctx; deal: Deal; children?: ReactNode }) {
  return (
    <a
      href={ghlContactUrl(ctx.data.locationId, deal.contactId)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="focus-ring rounded-sm text-foreground hover:text-accent"
      title="Open in GoHighLevel"
    >
      {children ?? (deal.company || deal.lead)}
    </a>
  );
}

function RepCell({ ctx, repKey }: { ctx: Ctx; repKey: string }) {
  const r = ctx.rep(repKey);
  return (
    <span className="flex items-center gap-2 whitespace-nowrap" title={r.email ?? undefined}>
      <Avatar rep={r} />
      <span className="font-medium text-foreground">{r.name}</span>
      <RepBadge status={r.status} />
    </span>
  );
}

function funnelSteps(s: Stats) {
  return [{ label: "Leads", value: s.leads }, ...MILESTONES.map((m) => ({ label: m.label, value: s.reached[m.key] }))];
}

function trendData(scope: Scope, ctx: Ctx) {
  return buckets(scope, ctx.period, ctx.data).map((b) => ({
    key: b.key,
    label: b.label,
    full: b.full,
    values: b.bySource,
    packages: b.packages,
  }));
}

const SOURCE_SERIES = SOURCES.map((s) => ({ key: s, label: s, color: SOURCE_COLORS[s] }));

// ================================================================== Overview

export function Overview({ ctx }: { ctx: Ctx }) {
  const { stats: s, prevStats: p, period } = ctx;
  const vs = period.prev?.label;
  const byRep = useMemo(() => [...splitScope(ctx.scope, "repKey")], [ctx.scope]);
  const top = byRep
    .map(([k, sc]) => ({ k, st: statsOf(sc, ctx.mIdx, (x) => ctx.rep(x).status, ctx.now) }))
    .filter((r) => r.k !== "team")
    .sort((a, b) => b.st.payable - a.st.payable || b.st.packages - a.st.packages || b.st.leads - a.st.leads)
    .slice(0, 5);
  const trend = trendData(ctx.scope, ctx);
  const quality = (field: DealField, order: readonly string[]) => {
    const m = new Map<string, number>();
    for (const d of ctx.scope.cohort) m.set(String(d[field]), (m.get(String(d[field])) ?? 0) + 1);
    return order.filter((o) => m.has(o)).map((o) => ({ key: o, label: o, value: m.get(o)!, sub: pct(m.get(o)!, s.leads) }));
  };
  const revenueOrder = ["Under $250,000", "$250,000 - $500,000", "$500,000 - $1 million", "$1 million - $2 million", "$2 million - $5 million", "$5 million+", "Not given"];
  const timelineOrder = ["As soon as possible", "Within 3 months", "3-6 months", "6-12 months", "More than 12 months", "Just exploring", "Not given"];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi hero label="Commission owed" value={moneyFull(s.payable)} delta={delta(s.payable, p?.payable)} deltaLabel={vs} format={moneyFull}
          detail={s.withheld ? `${moneyFull(s.withheld)} not payable (rep left)` : "to reps, for this period"} />
        <Kpi label="Financial packages" value={String(s.packages)} delta={delta(s.packages, p?.packages)} deltaLabel={vs} detail="accepted by the team" />
        <Kpi label="Deals closed" value={String(s.closed)} delta={delta(s.closed, p?.closed)} deltaLabel={vs} />
        <Kpi label="New leads" value={String(s.leads)} delta={delta(s.leads, p?.leads)} deltaLabel={vs} detail={`${s.selfSourced} self-sourced by reps`} />
        <Kpi label="Contact rate" value={pct(s.reached.contacted, s.leads)} detail={`${s.reached.contacted} of ${s.leads} leads worked`} />
        <Kpi label="Discovery calls held" value={String(s.held)} delta={delta(s.held, p?.held)} deltaLabel={vs}
          detail={`${s.callsBooked} booked · ${pct(s.held, s.held + s.noShows)} show rate`} />
        <Kpi label="Lead → financials" value={pct(s.reached.financials, s.leads)} detail="of this period's leads" />
        <Kpi label="Avg. days to financials" value={fmtDays(s.avgDaysToFinancials)} goodWhenUp={false} detail="lead created → package accepted" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" title={`New leads by ${period.bucket}`} subtitle="Split by where the lead came from">
          {s.leads ? (
            <StackedColumns title="New leads by source" series={SOURCE_SERIES.filter((x) => trend.some((t) => t.values[x.key]))} data={trend} unit="leads" />
          ) : (
            <Empty>No new leads in {period.label.toLowerCase()} for these filters.</Empty>
          )}
        </Card>
        <Card className="lg:col-span-2" title="Funnel" subtitle={`How far ${period.label.toLowerCase()}'s leads have got`}>
          <Funnel steps={funnelSteps(s)} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Top reps" subtitle="By commission earned this period">
          {top.length === 0 ? (
            <Empty>No reps yet. Add them in GoHighLevel with the role &ldquo;User&rdquo;.</Empty>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {top.map(({ k, st }, i) => (
                <li key={k}>
                  <button type="button" onClick={() => ctx.openProfile(k)} className="focus-ring flex w-full items-center gap-3 rounded-sm py-2 text-left hover:bg-background/40">
                    <span className="w-4 text-xs tabular-nums text-foreground-subtle">{i + 1}</span>
                    <Avatar rep={ctx.rep(k)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{ctx.rep(k).name}</span>
                      <span className="text-[11px] text-foreground-subtle">
                        {st.leads} leads · {st.packages} packages · {st.closed} closed
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{moneyFull(st.payable)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title="Lead quality: revenue" subtitle="What sellers said on the form">
          {s.leads ? <HBars title="Leads by revenue" rows={quality("revenue", revenueOrder)} /> : <Empty>No leads.</Empty>}
        </Card>
        <Card title="Lead quality: timeline to sell">
          {s.leads ? <HBars title="Leads by timeline" rows={quality("timeline", timelineOrder)} /> : <Empty>No leads.</Empty>}
        </Card>
      </div>
    </div>
  );
}

// ================================================================== Reps

interface RepRow {
  key: string;
  st: Stats;
}

export function RepsView({ ctx }: { ctx: Ctx }) {
  const rows: RepRow[] = useMemo(() => {
    const split = splitScope(ctx.scope, "repKey");
    const keys = new Set([...ctx.data.reps.map((r) => r.key), ...split.keys()]);
    return [...keys].map((k) => ({
      key: k,
      st: statsOf(split.get(k) ?? { deals: [], cohort: [], lines: [], calls: [], dealByContact: ctx.scope.dealByContact }, ctx.mIdx, (x) => ctx.rep(x).status, ctx.now),
    }));
  }, [ctx]);

  const cols: Column<RepRow>[] = [
    { key: "rep", label: "Rep", sort: (r) => ctx.rep(r.key).name, render: (r) => <RepCell ctx={ctx} repKey={r.key} /> },
    { key: "owed", label: "Owed", align: "right", sort: (r) => r.st.payable, render: (r) =>
      r.key === "team" ? <span className="text-foreground-subtle">house</span> : (
        <>
          <span className="font-semibold text-foreground">{moneyFull(r.st.payable)}</span>
          {r.st.withheld > 0 && <span className="block text-[11px] text-red-300 line-through">{moneyFull(r.st.withheld)}</span>}
        </>
      ) },
    { key: "leads", label: "Leads", align: "right", sort: (r) => r.st.leads, render: (r) => (
      <>{r.st.leads}{r.st.selfSourced > 0 && <span className="block text-[11px] text-foreground-subtle">{r.st.selfSourced} self</span>}</>
    ) },
    { key: "contact", label: "Contacted", align: "right", title: "Share of leads worked (moved past New Lead)", sort: (r) => ratio(r.st.reached.contacted, r.st.leads), render: (r) => pct(r.st.reached.contacted, r.st.leads) },
    { key: "disc", label: "Discovery", align: "right", title: "Share of leads that booked a discovery call", sort: (r) => ratio(r.st.reached.discovery, r.st.leads), render: (r) => (
      <span className="inline-flex items-center gap-2"><Meter value={r.st.reached.discovery} max={r.st.leads} />{pct(r.st.reached.discovery, r.st.leads)}</span>
    ) },
    { key: "held", label: "Calls held", align: "right", sort: (r) => r.st.held, render: (r) => (
      <>{r.st.held}{r.st.held + r.st.noShows > 0 && <span className="block text-[11px] text-foreground-subtle">{pct(r.st.held, r.st.held + r.st.noShows)} show</span>}</>
    ) },
    { key: "nda", label: "NDA", align: "right", title: "Leads from this period that signed the NDA", sort: (r) => r.st.reached.nda, render: (r) => r.st.reached.nda },
    { key: "pkg", label: "Financials", align: "right", title: "Financial packages accepted this period ($15 each)", sort: (r) => r.st.packages, render: (r) => r.st.packages },
    { key: "closed", label: "Closed", align: "right", sort: (r) => r.st.closed, render: (r) => r.st.closed },
    { key: "conv", label: "Lead→Fin", align: "right", title: "Share of this period's leads that reached Financials Received", sort: (r) => ratio(r.st.reached.financials, r.st.leads), render: (r) => pct(r.st.reached.financials, r.st.leads) },
    { key: "speed", label: "Days to fin", align: "right", title: "Average days from lead created to financials accepted", sort: (r) => r.st.avgDaysToFinancials ?? 9999, render: (r) => fmtDays(r.st.avgDaysToFinancials) },
    { key: "open", label: "Open", align: "right", sort: (r) => r.st.open, render: (r) => (
      <>{r.st.open}{r.st.quiet > 0 && <span className="block whitespace-nowrap text-[11px] text-amber-300">⚠ {r.st.quiet} quiet</span>}</>
    ) },
    { key: "active", label: "Last touch", align: "right", title: "Most recent activity on any of their leads", sort: (r) => r.st.lastActivity ?? "", render: (r) => (r.st.lastActivity ? `${daysSince(r.st.lastActivity, ctx.now)}d ago` : "—") },
  ];

  const pipeRows = rows
    .filter((r) => r.st.open > 0)
    .sort((a, b) => b.st.open - a.st.open)
    .map((r) => {
      const values: Record<string, number> = {};
      for (const d of ctx.scope.deals) if (d.repKey === r.key && d.group) values[d.group] = (values[d.group] ?? 0) + 1;
      return { key: r.key, name: ctx.rep(r.key).name, label: ctx.rep(r.key).name, values };
    });

  return (
    <div className="flex flex-col gap-4">
      <SortTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.key}
        initialSort={{ key: "owed", dir: "desc" }}
        onRowClick={(r) => ctx.openProfile(r.key)}
        minWidth={1080}
        empty="No reps match these filters."
      />
      <p className="text-[11px] text-foreground-subtle">
        Leads, contacted, discovery, NDA and lead→financials follow the leads created in {ctx.period.label.toLowerCase()}. Calls, financials,
        closed and owed count what happened in the period. Open deals and quiet deals are right now. Click a rep for their full profile.
      </p>
      <Card title="Open deals by stage" subtitle="Everything each rep is carrying right now">
        {pipeRows.length ? (
          <StackedBars rows={pipeRows} groups={STAGE_GROUPS.map((g, i) => ({ key: g.key, label: g.label, color: ORDINAL_RAMP[i] }))} />
        ) : (
          <Empty>No open deals.</Empty>
        )}
      </Card>
    </div>
  );
}

// ================================================================== Rep profile

export function RepProfile({ ctx, repKey, onClose }: { ctx: Ctx; repKey: string; onClose: () => void }) {
  const rep = ctx.rep(repKey);
  const sc = useMemo(() => splitScope(ctx.scope, "repKey").get(repKey) ?? { deals: [], cohort: [], lines: [], calls: [], dealByContact: ctx.scope.dealByContact }, [ctx.scope, repKey]);
  const st = statsOf(sc, ctx.mIdx, (x) => ctx.rep(x).status, ctx.now);
  const trend = trendData(sc, ctx);
  const mix = (field: DealField) => {
    const m = new Map<string, number>();
    for (const d of sc.cohort) m.set(String(d[field]), (m.get(String(d[field])) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ key: k, label: k, value: v, sub: pct(v, st.leads) }));
  };
  const lines = [...sc.lines].sort((a, b) => (a.at < b.at ? 1 : -1));
  const open = sc.deals.filter((d) => d.status === "open").sort((a, b) => b.stageIndex - a.stageIndex);
  const upcoming = sc.calls.filter((c) => c.status === "upcoming").sort((a, b) => (a.start < b.start ? -1 : 1));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={`${rep.name} profile`}>
      <button type="button" aria-label="Close profile" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-border-strong bg-background px-6 py-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar rep={rep} size={12} />
            <div>
              <h2 className="flex items-center gap-2 font-heading text-xl text-foreground">
                {rep.name} <RepBadge status={rep.status} />
              </h2>
              <p className="text-xs text-foreground-subtle">{rep.email ?? "Leads owned by the SillettiX team"} · {ctx.period.label}</p>
            </div>
          </div>
          <Button onClick={onClose} aria-label="Close profile">
            <X className="h-3.5 w-3.5" aria-hidden /> Close
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi hero label="Owed" value={repKey === "team" ? "—" : moneyFull(st.payable)} detail={st.withheld ? `${moneyFull(st.withheld)} withheld` : undefined} />
          <Kpi label="Leads" value={String(st.leads)} detail={`${st.selfSourced} self-sourced`} />
          <Kpi label="Financial packages" value={String(st.packages)} detail={`avg ${fmtDays(st.avgDaysToFinancials)} to get them`} />
          <Kpi label="Closed" value={String(st.closed)} />
          <Kpi label="Contact rate" value={pct(st.reached.contacted, st.leads)} />
          <Kpi label="Calls held" value={String(st.held)} detail={`${st.noShows} no-shows · ${st.upcoming} upcoming`} />
          <Kpi label="Open deals" value={String(st.open)} detail={st.quiet ? `⚠ ${st.quiet} quiet ${STALE_DAYS}d+` : "none quiet"} />
          <Kpi label="Last touch" value={st.lastActivity ? `${daysSince(st.lastActivity, ctx.now)}d ago` : "—"} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="Funnel"><Funnel steps={funnelSteps(st)} /></Card>
          <Card title={`Leads by ${ctx.period.bucket}`}>
            {st.leads ? <StackedColumns title="Leads by source" series={SOURCE_SERIES.filter((x) => trend.some((t) => t.values[x.key]))} data={trend} unit="leads" /> : <Empty>No leads in this period.</Empty>}
          </Card>
          <Card title="Where their leads come from">{st.leads ? <HBars title="Source mix" rows={mix("source")} /> : <Empty>No leads.</Empty>}</Card>
          <Card title="Industries">{st.leads ? <HBars title="Industry mix" rows={mix("industry")} /> : <Empty>No leads.</Empty>}</Card>
        </div>

        <Card className="mt-4" title="Commission this period" subtitle={`$${PACKAGE_RATE} per financial package, ${moneyFull(CLOSED_RATE)} per closed deal`}>
          {lines.length === 0 ? (
            <Empty>Nothing earned in {ctx.period.label.toLowerCase()} yet.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {lines.map((l) => {
                const d = ctx.scope.dealByContact.get(l.contactId);
                return (
                  <li key={`${l.contactId}-${l.kind}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      {d ? <LeadLink ctx={ctx} deal={d} /> : "Lead"}
                      <span className="block text-[11px] text-foreground-subtle">
                        {l.kind === "package" ? "Financial package" : "Closed deal"} · {dateFmt.format(new Date(l.at))}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">{moneyFull(l.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="mt-4" title={`Open deals (${open.length})`}>
          {open.length === 0 ? (
            <Empty>No open deals.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {open.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <LeadLink ctx={ctx} deal={d} />
                    <span className="block text-[11px] text-foreground-subtle">
                      {d.industryRaw || d.industry} · {d.revenue} · {d.state}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-foreground-muted">
                    {d.stage}
                    <span className={cn("block tabular-nums", isQuiet(d, ctx.now) && d.group !== "team" ? "text-amber-300" : "text-foreground-subtle")}>
                      {isQuiet(d, ctx.now) && d.group !== "team" ? "⚠ " : ""}
                      {daysSince(d.lastMoveAt, ctx.now)}d in stage
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {upcoming.length > 0 && (
          <Card className="mt-4" title="Upcoming calls">
            <CallList ctx={ctx} calls={upcoming} />
          </Card>
        )}
      </div>
    </div>
  );
}

// ================================================================== Sourcing

const SOURCING_DIMS = DIMENSIONS.filter((d) => !["stages", "statuses"].includes(d.key));

export function SourcingView({ ctx }: { ctx: Ctx }) {
  const [dim, setDim] = useState<(typeof SOURCING_DIMS)[number]["key"]>("sources");
  const def = SOURCING_DIMS.find((d) => d.key === dim)!;
  const rows = useMemo(() => {
    const split = splitScope(ctx.scope, def.field);
    return [...split].map(([value, sc]) => ({ value, st: statsOf(sc, ctx.mIdx, (x) => ctx.rep(x).status, ctx.now) }));
  }, [ctx, def.field]);
  const label = (v: string) => (dim === "reps" ? ctx.rep(v).name : v);
  const total = rows.reduce((t, r) => t + r.st.leads, 0);

  const cols: Column<(typeof rows)[number]>[] = [
    { key: "v", label: def.label, sort: (r) => label(r.value), render: (r) => (
      <span className="flex items-center gap-2 text-foreground">
        {dim === "sources" && <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: SOURCE_COLORS[r.value as keyof typeof SOURCE_COLORS] }} />}
        {label(r.value)}
      </span>
    ) },
    { key: "leads", label: "Leads", align: "right", sort: (r) => r.st.leads, render: (r) => r.st.leads },
    { key: "share", label: "Share", align: "right", sort: (r) => r.st.leads, render: (r) => pct(r.st.leads, total) },
    { key: "contact", label: "Contacted", align: "right", sort: (r) => ratio(r.st.reached.contacted, r.st.leads), render: (r) => pct(r.st.reached.contacted, r.st.leads) },
    { key: "disc", label: "Discovery", align: "right", sort: (r) => ratio(r.st.reached.discovery, r.st.leads), render: (r) => pct(r.st.reached.discovery, r.st.leads) },
    { key: "nda", label: "NDA", align: "right", sort: (r) => r.st.reached.nda, render: (r) => r.st.reached.nda },
    { key: "fin", label: "Reached fin.", align: "right", title: "Leads from this period now at Financials Received or later", sort: (r) => r.st.reached.financials, render: (r) => r.st.reached.financials },
    { key: "conv", label: "Lead→Fin", align: "right", sort: (r) => ratio(r.st.reached.financials, r.st.leads), render: (r) => (
      <span className="inline-flex items-center gap-2"><Meter value={r.st.reached.financials} max={r.st.leads} />{pct(r.st.reached.financials, r.st.leads)}</span>
    ) },
    { key: "won", label: "Closed", align: "right", sort: (r) => r.st.reached.won, render: (r) => r.st.reached.won },
    { key: "lost", label: "Lost", align: "right", sort: (r) => r.st.lost, render: (r) => r.st.lost },
  ];

  const matrix = useMemo(() => {
    const repKeys = [...new Set(ctx.scope.cohort.map((d) => d.repKey))];
    return repKeys.map((k) => {
      const cells: Record<string, { leads: number; fin: number }> = {};
      for (const d of ctx.scope.cohort.filter((x) => x.repKey === k)) {
        const c = (cells[d.source] ??= { leads: 0, fin: 0 });
        c.leads++;
        if (d.status === "won" || (d.status === "open" && d.stageIndex >= ctx.mIdx.financials)) c.fin++;
      }
      return { k, cells };
    });
  }, [ctx]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-foreground-subtle">Break down by</span>
        <Segmented label="Break down by" options={SOURCING_DIMS.map((d) => ({ value: d.key, label: d.label }))} value={dim} onChange={setDim} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2" title={`Leads by ${def.label.toLowerCase()}`} subtitle={ctx.period.label}>
          {total ? (
            <HBars
              title={`Leads by ${def.label}`}
              rows={[...rows].sort((a, b) => b.st.leads - a.st.leads).slice(0, 12).map((r) => ({ key: r.value, label: label(r.value), value: r.st.leads, sub: pct(r.st.leads, total) }))}
              detail={(k) => {
                const r = rows.find((x) => x.value === k)!;
                return (
                  <>
                    <p className="mb-1 text-foreground-muted">{label(k)}</p>
                    <p className="text-foreground">{r.st.leads} leads · {pct(r.st.reached.discovery, r.st.leads)} to discovery · {r.st.reached.financials} reached financials</p>
                  </>
                );
              }}
            />
          ) : (
            <Empty>No leads in this period.</Empty>
          )}
        </Card>
        <Card className="lg:col-span-3" title="Rep × source" subtitle="Leads per rep by source; the second number is how many reached financials">
          {matrix.length === 0 ? (
            <Empty>No leads in this period.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-foreground-subtle">
                    <th className="py-2 font-medium">Rep</th>
                    {SOURCES.map((s) => (
                      <th key={s} className="py-2 text-right font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-[2px]" style={{ background: SOURCE_COLORS[s] }} />
                          {s}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((m) => (
                    <tr key={m.k} className="border-t border-border">
                      <td className="py-2 text-foreground">{ctx.rep(m.k).name}</td>
                      {SOURCES.map((s) => (
                        <td key={s} className="py-2 text-right tabular-nums">
                          {m.cells[s] ? (
                            <span className="text-foreground">
                              {m.cells[s].leads}
                              <span className="ml-1 text-foreground-subtle">/ {m.cells[s].fin}</span>
                            </span>
                          ) : (
                            <span className="text-foreground-subtle">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <Card title="What converts" subtitle="Leads created this period and how far they got">
        <SortTable columns={cols} rows={rows} rowKey={(r) => r.value} initialSort={{ key: "leads", dir: "desc" }} minWidth={820} />
      </Card>
    </div>
  );
}

// ================================================================== Deals

export function DealsView({ ctx }: { ctx: Ctx }) {
  return <DealsWorkspace ctx={ctx} />;
}

// ================================================================== Commission

export function CommissionView({ ctx }: { ctx: Ctx }) {
  const lines = [...ctx.scope.lines].sort((a, b) => (a.at < b.at ? 1 : -1));
  const months = [...new Set(lines.map((l) => l.at.slice(0, 7)))].sort();
  const reps = [...new Set(lines.map((l) => l.repKey))].sort((a, b) => ctx.rep(a).name.localeCompare(ctx.rep(b).name));
  const payableOf = (repKey: string, kind: string, amount: number) => {
    const st = ctx.rep(repKey).status;
    return st === "team" ? 0 : st === "left" && kind === "closed" ? 0 : amount;
  };
  const cell = (k: string, m: string) =>
    lines.filter((l) => l.repKey === k && l.at.slice(0, 7) === m).reduce((t, l) => t + payableOf(l.repKey, l.kind, l.amount), 0);
  const monthLabel = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

  function exportCsv() {
    downloadCsv(`sillettix-commission-${ctx.period.label.replace(/\W+/g, "-").toLowerCase()}.csv`, [
      ["Date", "Rep", "Rep email", "Rep status", "Type", "Amount", "Payable", "Company", "Lead", "GHL link"],
      ...lines.map((l) => {
        const d = ctx.scope.dealByContact.get(l.contactId);
        const r = ctx.rep(l.repKey);
        return [l.at.slice(0, 10), r.name, r.email ?? "", r.status, l.kind === "package" ? "Financial package" : "Closed deal", l.amount,
          payableOf(l.repKey, l.kind, l.amount), d?.company ?? "", d?.lead ?? "", ghlContactUrl(ctx.data.locationId, l.contactId)];
      }),
    ]);
  }

  const total = lines.reduce((t, l) => t + payableOf(l.repKey, l.kind, l.amount), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi hero label="Payable" value={moneyFull(total)} detail={ctx.period.label} />
        <Kpi label="Financial packages" value={String(ctx.stats.packages)} detail={moneyFull(ctx.stats.pkgSum)} />
        <Kpi label="Closed deals" value={String(ctx.stats.closed)} detail={moneyFull(ctx.stats.closedSum)} />
        <Kpi label="Not payable" value={moneyFull(ctx.stats.withheld)} detail="$5,000s for reps who left" />
      </div>

      <Card
        title="Payout by rep and month"
        subtitle="What each rep is owed. Team-owned deals earn no commission."
        actions={
          <Button onClick={exportCsv} disabled={!lines.length}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Payout CSV
          </Button>
        }
      >
        {lines.length === 0 ? (
          <Empty>No commission in {ctx.period.label.toLowerCase()} yet. It&apos;s logged when the team moves a deal to Financials Received ($15) or Closed Won ($5,000).</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-foreground-subtle">
                  <th className="py-2 text-left font-medium">Rep</th>
                  {months.map((m) => <th key={m} className="py-2 text-right font-medium">{monthLabel(m)}</th>)}
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((k) => (
                  <tr key={k} className="border-t border-border">
                    <td className="py-2"><span className="flex items-center gap-2 text-foreground">{ctx.rep(k).name}<RepBadge status={ctx.rep(k).status} /></span></td>
                    {months.map((m) => <td key={m} className="py-2 text-right tabular-nums text-foreground-muted">{cell(k, m) ? moneyFull(cell(k, m)) : "—"}</td>)}
                    <td className="py-2 text-right font-semibold tabular-nums text-foreground">{moneyFull(months.reduce((t, m) => t + cell(k, m), 0))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-strong">
                  <td className="py-2 text-xs text-foreground-subtle">Total</td>
                  {months.map((m) => <td key={m} className="py-2 text-right tabular-nums text-foreground">{moneyFull(reps.reduce((t, k) => t + cell(k, m), 0))}</td>)}
                  <td className="py-2 text-right font-semibold tabular-nums text-accent">{moneyFull(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {lines.length > 0 && (
        <Card title="Every commission line">
          <ul className="flex flex-col divide-y divide-border">
            {lines.map((l) => {
              const d = ctx.scope.dealByContact.get(l.contactId);
              const pay = payableOf(l.repKey, l.kind, l.amount);
              return (
                <li key={`${l.contactId}-${l.kind}`} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 py-2 text-sm">
                  <span className="text-xs tabular-nums text-foreground-subtle">{dateFmt.format(new Date(l.at))}</span>
                  <span className="min-w-0">
                    {d ? <LeadLink ctx={ctx} deal={d} /> : "Lead"}
                    <span className="block text-[11px] text-foreground-subtle">
                      {ctx.rep(l.repKey).name} · {l.kind === "package" ? "Financial package" : "Closed deal"}
                    </span>
                  </span>
                  <span className="text-right tabular-nums">
                    <span className={cn("font-semibold", pay ? "text-foreground" : "text-foreground-subtle line-through")}>{moneyFull(l.amount)}</span>
                    {!pay && <span className="block text-[11px] text-foreground-subtle">{ctx.rep(l.repKey).status === "team" ? "team deal" : "rep left"}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ================================================================== Calls

function CallList({ ctx, calls }: { ctx: Ctx; calls: Call[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {calls.map((c) => {
        const d = ctx.scope.dealByContact.get(c.contactId) ?? ctx.data.deals.find((x) => x.contactId === c.contactId);
        return (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              {d ? <LeadLink ctx={ctx} deal={d} /> : "Lead"}
              <span className="block text-[11px] text-foreground-subtle">{ctx.rep(c.repKey).name} · {c.calendar}</span>
            </span>
            <span className="shrink-0 text-right text-xs text-foreground-muted">
              {dateTimeFmt.format(new Date(c.start))}
              <span className="block text-[11px] capitalize text-foreground-subtle">{c.status}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function CallsView({ ctx }: { ctx: Ctx }) {
  const s = ctx.stats;
  const rows = useMemo(() => {
    const split = splitScope(ctx.scope, "repKey");
    return [...split].filter(([, sc]) => sc.calls.length).map(([k, sc]) => ({ k, st: statsOf(sc, ctx.mIdx, (x) => ctx.rep(x).status, ctx.now) }));
  }, [ctx]);
  const upcoming = ctx.data.calls
    .filter((c) => c.status === "upcoming" && ctx.scope.dealByContact.has(c.contactId))
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .slice(0, 15);
  const unmarked = ctx.scope.calls.filter((c) => c.status === "unmarked").sort((a, b) => (a.start < b.start ? 1 : -1));

  const cols: Column<(typeof rows)[number]>[] = [
    { key: "rep", label: "Rep", sort: (r) => ctx.rep(r.k).name, render: (r) => <RepCell ctx={ctx} repKey={r.k} /> },
    { key: "booked", label: "Booked", align: "right", sort: (r) => r.st.callsBooked, render: (r) => r.st.callsBooked },
    { key: "held", label: "Held", align: "right", sort: (r) => r.st.held, render: (r) => r.st.held },
    { key: "noshow", label: "No-show", align: "right", sort: (r) => r.st.noShows, render: (r) => r.st.noShows },
    { key: "cancel", label: "Cancelled", align: "right", sort: (r) => r.st.cancelled, render: (r) => r.st.cancelled },
    { key: "show", label: "Show rate", align: "right", sort: (r) => ratio(r.st.held, r.st.held + r.st.noShows), render: (r) => pct(r.st.held, r.st.held + r.st.noShows) },
    { key: "up", label: "Upcoming", align: "right", sort: (r) => r.st.upcoming, render: (r) => r.st.upcoming },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi hero label="Calls held" value={String(s.held)} delta={delta(s.held, ctx.prevStats?.held)} deltaLabel={ctx.period.prev?.label} />
        <Kpi label="Booked" value={String(s.callsBooked)} />
        <Kpi label="Show rate" value={pct(s.held, s.held + s.noShows)} detail={`${s.noShows} no-shows`} />
        <Kpi label="Cancelled" value={String(s.cancelled)} goodWhenUp={false} />
        <Kpi label="Upcoming" value={String(upcoming.length)} detail="next scheduled" />
      </div>
      <SortTable columns={cols} rows={rows} rowKey={(r) => r.k} initialSort={{ key: "held", dir: "desc" }} empty="No discovery calls in this period." minWidth={680} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Upcoming calls">{upcoming.length ? <CallList ctx={ctx} calls={upcoming} /> : <Empty>Nothing scheduled.</Empty>}</Card>
        <Card title="Needs an outcome" subtitle="Past calls not marked showed / no-show in GoHighLevel">
          {unmarked.length ? <CallList ctx={ctx} calls={unmarked.slice(0, 15)} /> : <Empty>Every past call has an outcome.</Empty>}
        </Card>
      </div>
    </div>
  );
}
