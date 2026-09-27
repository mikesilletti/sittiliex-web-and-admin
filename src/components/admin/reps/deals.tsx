"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Flame,
  Mail,
  MessageSquarePlus,
  Phone,
  Rows3,
  StickyNote,
  Table2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STAGE_EFFECT,
  ORDINAL_RAMP,
  SOURCE_COLORS,
  STAGE_EFFECTS,
  STAGE_GROUPS,
  STALE_DAYS,
  ghlContactUrl,
  type DealDetail,
  type Deal,
  type StageGroupKey,
} from "@/lib/reps/shared";
import { acceptFinancials, addDealNote, getDealDetail, moveDealStage } from "@/lib/reps/actions";
import { SAVED_VIEWS, daysSince, downloadCsv, fitScore, fitTier, isQuiet, money, moneyFull, type SavedViewKey } from "./model";
import { Avatar, Button, ColumnMenu, Dialog, Empty, MenuButton, RepBadge, Segmented, SortTable, Toasts, useToasts, type Column } from "./ui";
import type { Ctx } from "./views";

// ------------------------------------------------------------------ helpers

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const GROUP_COLOR: Record<StageGroupKey, string> = Object.fromEntries(STAGE_GROUPS.map((g, i) => [g.key, ORDINAL_RAMP[i]])) as Record<StageGroupKey, string>;

function store<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private window etc. — preferences just don't persist */
  }
}

function FitBadge({ deal, compact }: { deal: Deal; compact?: boolean }) {
  const score = fitScore(deal);
  const tier = fitTier(score);
  return (
    <span
      title={`Fit score ${score}/100 from the seller's answers (revenue ${deal.revenue}, profit ${deal.profit}, timeline ${deal.timeline})`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
        tier === "hot" ? "bg-amber-400/15 text-amber-300" : tier === "warm" ? "bg-accent/15 text-accent" : "bg-border text-foreground-muted"
      )}
    >
      {tier === "hot" && <Flame className="h-2.5 w-2.5" aria-hidden />}
      {compact ? score : `${score} ${tier}`}
    </span>
  );
}

function StagePill({ deal }: { deal: Deal }) {
  if (deal.status === "won") return <span className="whitespace-nowrap text-xs font-medium text-emerald-400">✓ Closed won</span>;
  if (deal.status !== "open") return <span className="whitespace-nowrap text-xs text-foreground-subtle">✕ {deal.status === "lost" ? "Closed lost" : "Abandoned"}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-foreground">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: deal.group ? GROUP_COLOR[deal.group] : "var(--color-border-strong)" }} />
      {deal.stage}
    </span>
  );
}

function DaysInStage({ deal, now }: { deal: Deal; now: number }) {
  const d = daysSince(deal.lastMoveAt, now);
  const quiet = isQuiet(deal, now) && deal.group !== "team";
  return <span className={cn("tabular-nums", quiet ? "font-medium text-amber-300" : "text-foreground-muted")}>{quiet ? `⚠ ${d}d` : `${d}d`}</span>;
}

type Override = Pick<Deal, "stage" | "stageId" | "stageIndex" | "group" | "status">;
/** An optimistic move, applied only while the live data still shows the stage it left. */
type PendingOverride = Override & { from: string };

interface PendingMove {
  deal: Deal;
  stageId: string;
  stage: string;
  accept: boolean; // Financials Received goes through the team handoff
}

// ------------------------------------------------------------------ workspace

export function DealsWorkspace({ ctx }: { ctx: Ctx }) {
  const router = useRouter();
  const { toasts, push, dismiss } = useToasts();
  const [, startRefresh] = useTransition();
  const [view, setView] = useState<"table" | "board">("table");
  const [which, setWhich] = useState<"period" | "all">("period");
  const [saved, setSaved] = useState<SavedViewKey>("all");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [cols, setCols] = useState<string[]>(DEFAULT_COLS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, PendingOverride>>({});
  const [pending, setPending] = useState<PendingMove | null>(null);
  const [busy, setBusy] = useState(false);

  // Per-viewer preferences. Read after mount: the server render can't see
  // localStorage, and reading it during render would mismatch hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(store("sx-deals-view", "table"));
    setDensity(store("sx-deals-density", "comfortable"));
    setCols(store("sx-deals-cols", DEFAULT_COLS));
  }, []);
  useEffect(() => save("sx-deals-view", view), [view]);
  useEffect(() => save("sx-deals-density", density), [density]);
  useEffect(() => save("sx-deals-cols", cols), [cols]);

  const stageMeta = useMemo(() => {
    const names = ctx.data.stageNames;
    const bounds = STAGE_GROUPS.map((g) => ({ key: g.key, end: names.indexOf(g.until) }));
    return (stageId: string): Override => {
      const i = ctx.data.stages.findIndex((s) => s.id === stageId);
      const name = ctx.data.stages[i]?.name ?? "";
      const status: Deal["status"] = name === "Closed Won" ? "won" : name === "Closed Lost" ? "lost" : "open";
      return { stage: name, stageId, stageIndex: i, status, group: status === "open" ? (bounds.find((b) => i < b.end)?.key ?? null) : null };
    };
  }, [ctx.data.stageNames, ctx.data.stages]);

  const base = which === "period" ? ctx.scope.cohort : ctx.scope.deals;
  const withOverrides = useMemo(
    () => base.map((d) => (overrides[d.id] && overrides[d.id].from === d.stageId ? { ...d, ...overrides[d.id] } : d)),
    [base, overrides]
  );
  const counts = useMemo(
    () => Object.fromEntries(SAVED_VIEWS.map((v) => [v.key, withOverrides.filter((d) => v.test(d as Deal, ctx.now)).length])) as Record<SavedViewKey, number>,
    [withOverrides, ctx.now]
  );
  const rows = useMemo(() => {
    const v = SAVED_VIEWS.find((x) => x.key === saved)!;
    return withOverrides.filter((d) => v.test(d, ctx.now));
  }, [withOverrides, saved, ctx.now]);

  const callsBy = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of ctx.data.calls) if (c.status !== "cancelled") m.set(c.contactId, (m.get(c.contactId) ?? 0) + 1);
    return m;
  }, [ctx.data.calls]);

  // ---- summary
  const open = rows.filter((d) => d.status === "open");
  // Median, not a sum: one seller typing "$200M" would swamp a total.
  const asks = open.map((d) => d.askingValue).filter((v): v is number => v !== null).sort((a, b) => a - b);
  const medianAsk = asks.length ? (asks.length % 2 ? asks[(asks.length - 1) / 2] : (asks[asks.length / 2 - 1] + asks[asks.length / 2]) / 2) : null;
  const avgInStage = open.length ? open.reduce((t, d) => t + daysSince(d.lastMoveAt, ctx.now), 0) / open.length : 0;
  const quiet = open.filter((d) => isQuiet(d, ctx.now) && d.group !== "team").length;
  const hot = open.filter((d) => fitScore(d) >= 70).length;

  // ---- moves
  const requestMove = useCallback(
    (deal: Deal, stageId: string) => {
      if (stageId === deal.stageId) return;
      const stage = ctx.data.stages.find((s) => s.id === stageId)?.name ?? "";
      setPending({ deal, stageId, stage, accept: stage === "Financials Received" });
    },
    [ctx.data.stages]
  );

  async function confirmMove() {
    if (!pending) return;
    const { deal, stageId, stage, accept } = pending;
    setBusy(true);
    setOverrides((o) => ({ ...o, [deal.id]: { ...stageMeta(stageId), from: deal.stageId } }));
    const res = accept ? await acceptFinancials(deal.id) : await moveDealStage(deal.id, stageId);
    setBusy(false);
    setPending(null);
    if (res.ok) {
      push("success", accept ? `Financials accepted for ${deal.company || deal.lead}.${ctx.rep(deal.repKey).status === "team" ? "" : ` $15 logged for ${ctx.rep(deal.repKey).name}.`}` : `${deal.company || deal.lead} moved to ${stage}.`);
      startRefresh(() => router.refresh());
    } else {
      setOverrides((o) => {
        const n = { ...o };
        delete n[deal.id];
        return n;
      });
      push("error", `Couldn't move ${deal.company || deal.lead}: ${res.error}`);
    }
  }

  // ---- export
  function exportCsv(list: Deal[], label: string) {
    downloadCsv(`sillettix-deals-${label}-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Company", "Lead", "Rep", "Source", "Fit score", "Industry", "Industry (as typed)", "State", "Location (as typed)", "Revenue", "Profit", "Asking", "Timeline", "Stage", "Status", "Days in stage", "Calls", "Created", "GHL link"],
      ...list.map((d) => [
        d.company, d.lead, ctx.rep(d.repKey).name, d.source, fitScore(d), d.industry, d.industryRaw, d.state, d.locationRaw, d.revenue, d.profit,
        d.askingValue ?? "", d.timeline, d.stage, d.status, daysSince(d.lastMoveAt, ctx.now), callsBy.get(d.contactId) ?? 0, d.createdAt.slice(0, 10),
        ghlContactUrl(ctx.data.locationId, d.contactId),
      ]),
    ]);
  }

  const openIndex = openId ? rows.findIndex((d) => d.id === openId) : -1;
  const openDeal = openIndex >= 0 ? rows[openIndex] : openId ? withOverrides.find((d) => d.id === openId) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      {/* ---- saved views */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Saved views">
        {SAVED_VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={saved === v.key}
            onClick={() => {
              setSaved(v.key);
              setSelected(new Set());
            }}
            className={cn(
              "focus-ring inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              saved === v.key ? "border-accent/60 bg-accent/15 text-foreground" : "border-border text-foreground-muted hover:border-border-strong hover:text-foreground"
            )}
          >
            {v.key === "hot" && <Flame className="h-3 w-3 text-amber-300" aria-hidden />}
            {v.key === "quiet" && <span aria-hidden className="text-amber-300">⚠</span>}
            {v.label}
            <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", saved === v.key ? "bg-accent/20 text-accent" : "bg-border text-foreground-subtle")}>
              {counts[v.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ---- summary strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Deals", value: String(rows.length), sub: `${open.length} open` },
          { label: "Median asking price", value: medianAsk ? money(medianAsk) : "—", sub: `${asks.length} open deals gave a price` },
          { label: "Hot leads", value: String(hot), sub: "fit score 70+" },
          { label: "Avg. days in stage", value: open.length ? `${Math.round(avgInStage)}d` : "—", sub: "open deals" },
          { label: "Gone quiet", value: String(quiet), sub: `no move in ${STALE_DAYS}+ days`, warn: quiet > 0 },
          { label: "Won / lost", value: `${rows.filter((d) => d.status === "won").length} / ${rows.filter((d) => d.status === "lost" || d.status === "abandoned").length}`, sub: "in this list" },
        ].map((s) => (
          <div key={s.label} className="bg-background-raised px-4 py-3">
            <p className="text-[11px] text-foreground-subtle">{s.label}</p>
            <p className={cn("mt-0.5 text-lg font-semibold", s.warn ? "text-amber-300" : "text-foreground")}>{s.value}</p>
            <p className="text-[11px] text-foreground-subtle">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ---- toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Layout"
          value={view}
          onChange={setView}
          options={[
            { value: "table", label: "Table" },
            { value: "board", label: "Board" },
          ]}
        />
        <Segmented
          label="Which deals"
          value={which}
          onChange={(w) => {
            setWhich(w);
            setSelected(new Set());
          }}
          options={[
            { value: "period", label: `Created ${ctx.period.label === "All time" ? "any time" : `in ${ctx.period.label.toLowerCase()}`}` },
            { value: "all", label: "All matching deals" },
          ]}
        />
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {view === "table" && (
            <>
              <Button onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")} aria-label="Row density">
                {density === "compact" ? <Rows3 className="h-3.5 w-3.5" aria-hidden /> : <Table2 className="h-3.5 w-3.5" aria-hidden />}
                {density === "compact" ? "Compact" : "Comfortable"}
              </Button>
              <ColumnMenu columns={OPTIONAL_COLS} visible={cols} onChange={setCols} />
            </>
          )}
          <Button onClick={() => exportCsv(rows, saved)} disabled={!rows.length}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Export {rows.length}
          </Button>
        </span>
      </div>

      {selected.size > 0 && view === "table" && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm">
          <span className="font-medium text-foreground">{selected.size} selected</span>
          <Button onClick={() => exportCsv(rows.filter((d) => selected.has(d.id)), "selected")}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Export selected
          </Button>
          <Button variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {view === "table" ? (
        <DealsTable
          ctx={ctx}
          rows={rows}
          cols={cols}
          density={density}
          selected={selected}
          setSelected={setSelected}
          callsBy={callsBy}
          onOpen={(d) => setOpenId(d.id)}
          activeId={openId}
        />
      ) : (
        <DealsBoard ctx={ctx} rows={rows} onOpen={(d) => setOpenId(d.id)} onMove={requestMove} />
      )}

      {openDeal && (
        <DealDrawer
          key={openDeal.contactId}
          ctx={ctx}
          deal={openDeal}
          position={openIndex >= 0 ? `${openIndex + 1} of ${rows.length}` : undefined}
          onPrev={openIndex > 0 ? () => setOpenId(rows[openIndex - 1].id) : undefined}
          onNext={openIndex >= 0 && openIndex < rows.length - 1 ? () => setOpenId(rows[openIndex + 1].id) : undefined}
          onClose={() => setOpenId(null)}
          onMove={requestMove}
          calls={ctx.data.calls.filter((c) => c.contactId === openDeal.contactId)}
          push={push}
        />
      )}

      {pending && (
        <Dialog
          title={pending.accept ? `Accept financials for ${pending.deal.company || pending.deal.lead}?` : `Move ${pending.deal.company || pending.deal.lead} to ${pending.stage}?`}
          onClose={() => !busy && setPending(null)}
          actions={
            <>
              <Button variant="ghost" onClick={() => setPending(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmMove} disabled={busy}>
                {busy ? "Working…" : pending.accept ? "Accept financials" : "Move deal"}
              </Button>
            </>
          }
        >
          <p className="flex flex-wrap items-center gap-2 text-foreground">
            <StagePill deal={pending.deal} /> <ArrowRight className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden />
            <span className="font-medium">{pending.stage}</span>
          </p>
          {pending.accept && (
            <p className="mt-3">
              This hands the deal to the SillettiX team, then moves it to Financials Received, the same as doing it in GoHighLevel.{" "}
              {ctx.rep(pending.deal.repKey).status === "team" ? (
                "This lead is the team's own, so no commission is paid."
              ) : (
                <>
                  The $15 goes to <span className="text-foreground">{ctx.rep(pending.deal.repKey).name}</span>.
                </>
              )}
            </p>
          )}
          <p className="mt-3 rounded-md border border-border bg-background-raised px-3 py-2 text-xs">
            <span className="font-medium text-foreground">In GoHighLevel this will: </span>
            {STAGE_EFFECTS[pending.stage] ?? DEFAULT_STAGE_EFFECT}
          </p>
        </Dialog>
      )}

      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

// ------------------------------------------------------------------ table

const OPTIONAL_COLS = [
  { key: "fit", label: "Fit score" },
  { key: "rep", label: "Rep" },
  { key: "source", label: "Source" },
  { key: "industry", label: "Industry" },
  { key: "state", label: "State" },
  { key: "revenue", label: "Revenue" },
  { key: "profit", label: "Profit" },
  { key: "asking", label: "Asking price" },
  { key: "timeline", label: "Timeline" },
  { key: "stage", label: "Stage" },
  { key: "moved", label: "Days in stage" },
  { key: "activity", label: "Last activity" },
  { key: "calls", label: "Calls" },
  { key: "created", label: "Created" },
];
const DEFAULT_COLS = ["fit", "rep", "source", "industry", "state", "revenue", "asking", "timeline", "stage", "moved", "calls", "created"];

function DealsTable({
  ctx,
  rows,
  cols,
  density,
  selected,
  setSelected,
  callsBy,
  onOpen,
  activeId,
}: {
  ctx: Ctx;
  rows: Deal[];
  cols: string[];
  density: "comfortable" | "compact";
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  callsBy: Map<string, number>;
  onOpen: (d: Deal) => void;
  activeId: string | null;
}) {
  const allOn = rows.length > 0 && rows.every((d) => selected.has(d.id));
  const pad = density === "compact" ? "py-0" : "py-1";
  const all: Column<Deal>[] = [
    {
      key: "select",
      label: "",
      render: (d) => (
        <input
          type="checkbox"
          aria-label={`Select ${d.company || d.lead}`}
          checked={selected.has(d.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {
            const n = new Set(selected);
            if (n.has(d.id)) n.delete(d.id);
            else n.add(d.id);
            setSelected(n);
          }}
          className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
        />
      ),
    },
    {
      key: "company",
      label: "Company",
      sort: (d) => (d.company || d.lead).toLowerCase(),
      className: "max-w-[16rem]",
      render: (d) => (
        <span className={cn("flex flex-col", pad)}>
          <span className="truncate font-medium text-foreground" title={d.company || d.lead}>{d.company || d.lead}</span>
          {density === "comfortable" && <span className="truncate text-[11px] text-foreground-subtle">{d.lead}</span>}
        </span>
      ),
    },
    { key: "fit", label: "Fit", align: "right", title: "Fit score from the seller's answers", sort: (d) => fitScore(d), render: (d) => <FitBadge deal={d} compact /> },
    { key: "rep", label: "Rep", sort: (d) => ctx.rep(d.repKey).name, render: (d) => (
      <span className="flex items-center gap-2 whitespace-nowrap text-foreground-muted">
        {density === "comfortable" && <Avatar rep={ctx.rep(d.repKey)} />}
        {ctx.rep(d.repKey).name}
      </span>
    ) },
    { key: "source", label: "Source", sort: (d) => d.source, render: (d) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-foreground-muted">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: SOURCE_COLORS[d.source] }} />
        {d.source}
      </span>
    ) },
    { key: "industry", label: "Industry", sort: (d) => d.industry, render: (d) => <span className="whitespace-nowrap text-foreground-muted" title={d.industryRaw}>{d.industry}</span> },
    { key: "state", label: "State", sort: (d) => d.state, render: (d) => <span className="text-foreground-muted" title={d.locationRaw}>{d.state}</span> },
    { key: "revenue", label: "Revenue", sort: (d) => d.revenue, render: (d) => <span className="whitespace-nowrap text-foreground-muted">{d.revenue}</span> },
    { key: "profit", label: "Profit", sort: (d) => d.profit, render: (d) => <span className="whitespace-nowrap text-foreground-muted">{d.profit}</span> },
    { key: "asking", label: "Asking", align: "right", sort: (d) => d.askingValue ?? -1, render: (d) => (d.askingValue ? <span className="text-foreground">{money(d.askingValue)}</span> : <span className="text-foreground-subtle">—</span>) },
    { key: "timeline", label: "Timeline", sort: (d) => d.timeline, render: (d) => <span className="whitespace-nowrap text-foreground-muted">{d.timeline}</span> },
    { key: "stage", label: "Stage", sort: (d) => d.stageIndex, render: (d) => <StagePill deal={d} /> },
    { key: "moved", label: "In stage", align: "right", title: "Days since the deal last changed stage", sort: (d) => daysSince(d.lastMoveAt, ctx.now), render: (d) => <DaysInStage deal={d} now={ctx.now} /> },
    { key: "activity", label: "Last activity", align: "right", sort: (d) => d.lastActivityAt ?? "", render: (d) => (d.lastActivityAt ? <span className="text-foreground-muted">{daysSince(d.lastActivityAt, ctx.now)}d ago</span> : <span className="text-foreground-subtle">—</span>) },
    { key: "calls", label: "Calls", align: "right", sort: (d) => callsBy.get(d.contactId) ?? 0, render: (d) => callsBy.get(d.contactId) ?? 0 },
    { key: "created", label: "Created", align: "right", sort: (d) => d.createdAt, render: (d) => <span className="text-foreground-muted">{dateFmt.format(new Date(d.createdAt))}</span> },
  ];
  const columns = all.filter((c) => c.key === "select" || c.key === "company" || cols.includes(c.key));

  return (
    <div className="flex flex-col gap-2">
      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-foreground-muted">
        <input
          type="checkbox"
          checked={allOn}
          onChange={() => setSelected(allOn ? new Set() : new Set(rows.map((d) => d.id)))}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        Select all {rows.length}
      </label>
      <SortTable
        columns={columns}
        rows={rows}
        rowKey={(d) => d.id}
        initialSort={{ key: "created", dir: "desc" }}
        onRowClick={onOpen}
        activeKey={activeId}
        pageSize={density === "compact" ? 100 : 50}
        minWidth={Math.max(760, 220 + columns.length * 105)}
        empty="No deals match. Try another saved view or clear some filters."
      />
    </div>
  );
}

// ------------------------------------------------------------------ board

function DealsBoard({
  ctx,
  rows,
  onOpen,
  onMove,
}: {
  ctx: Ctx;
  rows: Deal[];
  onOpen: (d: Deal) => void;
  onMove: (d: Deal, stageId: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [dragging, setDragging] = useState<Deal | null>(null);
  const byStage = useMemo(() => {
    const m = new Map<string, Deal[]>();
    for (const d of rows) m.set(d.stageId, [...(m.get(d.stageId) ?? []), d]);
    for (const list of m.values()) list.sort((a, b) => fitScore(b) - fitScore(a));
    return m;
  }, [rows]);

  if (!rows.length) return <Empty>No deals match. Try another saved view or clear some filters.</Empty>;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setDragging(rows.find((d) => d.id === e.active.id) ?? null)}
      onDragCancel={() => setDragging(null)}
      onDragEnd={(e: DragEndEvent) => {
        setDragging(null);
        const deal = rows.find((d) => d.id === e.active.id);
        if (deal && e.over) onMove(deal, String(e.over.id));
      }}
    >
      <p className="text-[11px] text-foreground-subtle">Drag a deal to another stage to move it in GoHighLevel. You&apos;ll confirm first. Click a card for the full deal.</p>
      <div className="-mx-6 overflow-x-auto px-6 pb-3">
        <div className="flex min-w-max gap-2.5">
          {ctx.data.stages.map((s) => (
            <BoardColumn key={s.id} ctx={ctx} stage={s} deals={byStage.get(s.id) ?? []} onOpen={onOpen} dragging={!!dragging} />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>{dragging && <DealCard ctx={ctx} deal={dragging} overlay />}</DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  ctx,
  stage,
  deals,
  onOpen,
  dragging,
}: {
  ctx: Ctx;
  stage: { id: string; name: string };
  deals: Deal[];
  onOpen: (d: Deal) => void;
  dragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const empty = deals.length === 0;
  const color = deals[0]?.group ? GROUP_COLOR[deals[0].group] : stage.name === "Closed Won" ? "#0ca30c" : "var(--color-border-strong)";
  return (
    <section
      ref={setNodeRef}
      aria-label={`${stage.name}: ${deals.length} deals`}
      className={cn(
        "flex shrink-0 flex-col rounded-lg border transition-colors",
        empty && !dragging ? "w-11 border-dashed border-border" : "w-72 border-border bg-background-raised/60",
        isOver && "border-accent bg-accent/10"
      )}
    >
      {empty && !dragging ? (
        <div className="flex h-full min-h-[18rem] flex-col items-center gap-2 py-3">
          <span className="text-[10px] tabular-nums text-foreground-subtle">0</span>
          <span className="text-[11px] text-foreground-subtle [writing-mode:vertical-rl]">{stage.name}</span>
        </div>
      ) : (
        <>
          <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
            <h3 className="flex-1 truncate text-xs font-semibold text-foreground" title={stage.name}>{stage.name}</h3>
            <span className="rounded-full bg-border px-1.5 text-[10px] tabular-nums text-foreground-muted">{deals.length}</span>
          </header>
          <div className="flex max-h-[34rem] min-h-[6rem] flex-col gap-2 overflow-y-auto p-2">
            {deals.map((d) => (
              <DraggableCard key={d.id} ctx={ctx} deal={d} onOpen={onOpen} />
            ))}
            {empty && <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-[11px] text-foreground-subtle">Drop here</p>}
          </div>
        </>
      )}
    </section>
  );
}

function DraggableCard({ ctx, deal, onOpen }: { ctx: Ctx; deal: Deal; onOpen: (d: Deal) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={cn("outline-none", isDragging && "opacity-30")}>
      <DealCard ctx={ctx} deal={deal} onClick={() => onOpen(deal)} />
    </div>
  );
}

function DealCard({ ctx, deal, onClick, overlay }: { ctx: Ctx; deal: Deal; onClick?: () => void; overlay?: boolean }) {
  const rep = ctx.rep(deal.repKey);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring flex w-full cursor-grab flex-col gap-2 rounded-md border bg-background-raised p-3 text-left transition-colors active:cursor-grabbing",
        overlay ? "w-72 rotate-1 border-accent shadow-2xl shadow-black/60" : "border-border hover:border-accent/40"
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{deal.company || deal.lead}</span>
          <span className="block truncate text-[11px] text-foreground-subtle">{deal.lead}</span>
        </span>
        <FitBadge deal={deal} compact />
      </span>
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-muted">
        <span>{deal.revenue}</span>
        {deal.askingValue ? <span>asks {money(deal.askingValue)}</span> : null}
        <span>{deal.state}</span>
      </span>
      <span className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex min-w-0 items-center gap-1.5 text-foreground-muted">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: SOURCE_COLORS[deal.source] }} />
          <span className="truncate">{rep.name}</span>
        </span>
        <DaysInStage deal={deal} now={ctx.now} />
      </span>
    </button>
  );
}

// ------------------------------------------------------------------ drawer

function Section({ title, icon, children, action }: { title: string; icon?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-background-raised p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DealDrawer({
  ctx,
  deal,
  position,
  onPrev,
  onNext,
  onClose,
  onMove,
  calls,
  push,
}: {
  ctx: Ctx;
  deal: Deal;
  position?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  onMove: (d: Deal, stageId: string) => void;
  calls: Ctx["data"]["calls"];
  push: (tone: "success" | "error" | "info", text: string) => void;
}) {
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const rep = ctx.rep(deal.repKey);
  const score = fitScore(deal);
  const lines = ctx.data.commission.filter((c) => c.contactId === deal.contactId);
  const finIdx = ctx.data.stageNames.indexOf("Financials Received");
  const canAccept = deal.status === "open" && deal.stageIndex < finIdx;

  useEffect(() => {
    let cancelled = false;
    getDealDetail(deal.contactId).then((r) => {
      if (cancelled) return;
      if (r.ok) setDetail(r.data);
      else setLoadError(r.error);
    });
    return () => {
      cancelled = true;
    };
  }, [deal.contactId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select");
      if (e.key === "Escape") onClose();
      else if (!typing && e.key === "ArrowLeft" && onPrev) onPrev();
      else if (!typing && e.key === "ArrowRight" && onNext) onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  async function saveNote() {
    setSaving(true);
    const r = await addDealNote(deal.contactId, note);
    setSaving(false);
    if (r.ok) {
      setDetail((d) => (d ? { ...d, notes: [r.data, ...d.notes] } : d));
      setNote("");
      push("success", "Note saved to GoHighLevel.");
    } else push("error", `Couldn't save the note: ${r.error}`);
  }

  const facts: [string, ReactNode][] = [
    ["Industry", <span key="i" title={deal.industryRaw}>{deal.industryRaw || deal.industry}</span>],
    ["Location", <span key="l">{deal.locationRaw || "—"} {deal.state !== "Unknown" && <span className="text-foreground-subtle">({deal.state})</span>}</span>],
    ["Revenue", deal.revenue],
    ["Profit", deal.profit],
    ["Asking price", deal.askingValue ? moneyFull(deal.askingValue) : "Not given"],
    ["Timeline", deal.timeline],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${deal.company || deal.lead} deal`}>
      <button type="button" aria-label="Close deal" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-border-strong bg-background shadow-2xl">
        {/* header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-3 text-xs text-foreground-subtle">
            <span className="flex items-center gap-1">
              <Button variant="ghost" onClick={onPrev} disabled={!onPrev} aria-label="Previous deal (←)">
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <Button variant="ghost" onClick={onNext} disabled={!onNext} aria-label="Next deal (→)">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
              {position && <span className="tabular-nums">{position}</span>}
            </span>
            <Button variant="ghost" onClick={onClose} aria-label="Close (Esc)">
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate font-heading text-2xl text-foreground">{deal.company || deal.lead}</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">{deal.lead}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StagePill deal={deal} />
                <FitBadge deal={deal} />
                <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: SOURCE_COLORS[deal.source] }} />
                  {deal.source}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-right">
              <span>
                <span className="block text-xs text-foreground-muted">{rep.name}</span>
                <span className="flex justify-end"><RepBadge status={rep.status} /></span>
              </span>
              <Avatar rep={rep} size={10} />
            </div>
          </div>

          {/* actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={ghlContactUrl(ctx.data.locationId, deal.contactId)}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-accent bg-accent px-3 text-xs font-medium text-background hover:bg-accent-hover"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open in GoHighLevel
            </a>
            {canAccept && (
              <Button onClick={() => onMove(deal, ctx.data.stages[finIdx].id)}>✓ Accept financials</Button>
            )}
            <MenuButton
              label="Move to stage"
              icon={<ArrowRight className="h-3.5 w-3.5" aria-hidden />}
              items={ctx.data.stages.map((s) => ({
                value: s.id,
                label: s.name,
                current: s.id === deal.stageId,
                hint: s.id === deal.stageId ? "current" : s.name === "Financials Received" ? "accepts financials" : undefined,
              }))}
              onSelect={(v) => onMove(deal, v)}
            />
          </div>
        </div>

        {/* body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border text-center">
            {[
              ["Fit score", `${score}`, fitTier(score)],
              ["In stage", `${daysSince(deal.lastMoveAt, ctx.now)}d`, isQuiet(deal, ctx.now) && deal.group !== "team" ? "gone quiet" : "since last move"],
              ["Lead age", `${daysSince(deal.createdAt, ctx.now)}d`, `since ${dateFmt.format(new Date(deal.createdAt))}`],
            ].map(([l, v, s]) => (
              <div key={l} className="bg-background-raised px-3 py-3">
                <p className="text-[11px] text-foreground-subtle">{l}</p>
                <p className="text-xl font-semibold text-foreground">{v}</p>
                <p className="text-[11px] text-foreground-subtle">{s}</p>
              </div>
            ))}
          </div>

          <Section title="What the seller told us">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] text-foreground-subtle">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Contact">
            {loadError ? (
              <p className="text-sm text-red-300">Couldn&apos;t load from GoHighLevel: {loadError}</p>
            ) : !detail ? (
              <div className="h-12 animate-pulse rounded-md bg-background" />
            ) : (
              <div className="flex flex-col gap-2 text-sm">
                {detail.phone && (
                  <a href={`tel:${detail.phone}`} className="focus-ring flex w-fit items-center gap-2 rounded-sm text-foreground hover:text-accent">
                    <Phone className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden /> {detail.phone}
                  </a>
                )}
                {detail.email && (
                  <a href={`mailto:${detail.email}`} className="focus-ring flex w-fit items-center gap-2 rounded-sm text-foreground hover:text-accent">
                    <Mail className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden /> {detail.email}
                  </a>
                )}
                {!detail.phone && !detail.email && <p className="text-foreground-subtle">No phone or email on file.</p>}
                {detail.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {detail.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2 py-px text-[10px] text-foreground-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Activity" icon={<CalendarClock className="h-3.5 w-3.5" aria-hidden />}>
            <ol className="relative flex flex-col gap-3 border-l border-border pl-4 text-sm">
              {[
                ...calls.map((c) => ({ at: c.start, text: `Discovery call · ${c.status}`, tone: c.status === "held" ? "good" : c.status === "no-show" ? "bad" : "info" })),
                ...lines.map((l) => ({ at: l.at, text: l.kind === "package" ? "Financial package accepted · $15 logged" : "Deal closed won · $5,000 logged", tone: "good" })),
                { at: deal.lastMoveAt, text: `Moved to ${deal.stage}`, tone: "info" },
                { at: deal.createdAt, text: `Lead came in from ${deal.source}`, tone: "info" },
              ]
                .sort((a, b) => (a.at < b.at ? 1 : -1))
                .map((e, i) => (
                  <li key={`${e.at}-${i}`} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full ring-4 ring-background-raised",
                        e.tone === "good" ? "bg-emerald-400" : e.tone === "bad" ? "bg-red-400" : "bg-accent"
                      )}
                    />
                    <span className="text-foreground">{e.text}</span>
                    <span className="block text-[11px] text-foreground-subtle">{dateTimeFmt.format(new Date(e.at))}</span>
                  </li>
                ))}
            </ol>
          </Section>

          {detail && detail.tasks.length > 0 && (
            <Section title={`Tasks (${detail.tasks.filter((t) => !t.done).length} open)`}>
              <ul className="flex flex-col divide-y divide-border text-sm">
                {detail.tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                    <span className={cn(t.done ? "text-foreground-subtle line-through" : "text-foreground")}>{t.title}</span>
                    {t.due && <span className="shrink-0 text-[11px] text-foreground-subtle">{dateFmt.format(new Date(t.due))}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Notes" icon={<StickyNote className="h-3.5 w-3.5" aria-hidden />}>
            <div className="flex flex-col gap-2">
              <label htmlFor="deal-note" className="sr-only">Add a note</label>
              <textarea
                id="deal-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && note.trim()) saveNote();
                }}
                rows={3}
                placeholder="Add a note. It's saved to the contact in GoHighLevel. (Ctrl+Enter to save)"
                className="focus-ring w-full resize-y rounded-md border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle"
              />
              <div className="flex justify-end">
                <Button variant="primary" onClick={saveNote} disabled={!note.trim() || saving}>
                  <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden /> {saving ? "Saving…" : "Save note"}
                </Button>
              </div>
              {!detail && !loadError && <div className="h-16 animate-pulse rounded-md bg-background" />}
              {detail && detail.notes.length === 0 && <p className="text-sm text-foreground-subtle">No notes yet.</p>}
              {detail && detail.notes.length > 0 && (
                <ul className="mt-1 flex flex-col gap-2">
                  {detail.notes.map((n) => (
                    <li key={n.id} className="rounded-md border border-border bg-background px-3 py-2">
                      <p className="whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-foreground-subtle">{dateTimeFmt.format(new Date(n.at))}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
          <p className="pb-2 text-center text-[11px] text-foreground-subtle">← → to move between deals · Esc to close</p>
        </div>
      </div>
    </div>
  );
}

