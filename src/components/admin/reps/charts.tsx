"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Chart conventions (dataviz method): bars <= 24px with a 4px rounded data-end
// and square baseline, 2px surface gaps between stacked segments, solid
// hairline grid, legend for >= 2 series, selective direct labels, a hover +
// focus tooltip on every mark, and an sr-only table twin for each chart.

const GRID = "var(--color-border)";
const MUTED = "var(--color-foreground-subtle)";

function niceMax(n: number) {
  if (n <= 4) return Math.max(n, 4);
  const pow = 10 ** Math.floor(Math.log10(n));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= n) return m * pow;
  return 10 * pow;
}

/** Column whose top segment gets the rounded data-end. */
function roundedTop(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  const b = y + h;
  return `M${x},${b} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${b} Z`;
}
function roundedRight(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, h / 2, w);
  const e = x + w;
  return `M${x},${y} H${e - r} Q${e},${y} ${e},${y + r} V${y + h - r} Q${e},${y + h} ${e - r},${y + h} H${x} Z`;
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function Tip({ children, left, top }: { children: ReactNode; left: string; top?: number }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 min-w-[9rem] -translate-x-1/2 rounded-sm border border-border-strong bg-background-overlay px-2.5 py-1.5 text-[11px] shadow-lg"
      style={{ left, top: top ?? -4 }}
    >
      {children}
    </div>
  );
}

function TipRow({ color, label, value }: { color?: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-foreground-muted">
        {color && <span className="h-0.5 w-3 rounded-full" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

// ------------------------------------------------------------------ stacked columns

export function StackedColumns({
  title,
  series,
  data,
  unit,
}: {
  title: string;
  series: { key: string; label: string; color: string }[];
  data: { key: string; label: string; full: string; values: Record<string, number> }[];
  unit: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 190;
  const L = 28;
  const B = 22;
  const T = 12;
  const totals = data.map((d) => series.reduce((t, s) => t + (d.values[s.key] ?? 0), 0));
  const max = niceMax(Math.max(0, ...totals));
  const plotW = W - L;
  const plotH = H - B - T;
  const step = plotW / Math.max(1, data.length);
  const barW = Math.min(24, Math.max(4, step - 6));
  const labelEvery = Math.ceil(data.length / 12);
  const peak = totals.indexOf(Math.max(...totals));
  const y = (v: number) => T + plotH * (1 - v / max);

  return (
    <figure>
      {series.length > 1 && <Legend items={series} />}
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${title}. Data table follows.`} onMouseLeave={() => setHover(null)}>
          {[max / 2, max].map((v) => (
            <g key={v}>
              <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth="1" />
              <text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill={MUTED}>
                {Number.isInteger(v) ? v : v.toFixed(1)}
              </text>
            </g>
          ))}
          <line x1={L} x2={W} y1={T + plotH} y2={T + plotH} stroke={GRID} strokeWidth="1" />
          {data.map((d, i) => {
            const x = L + i * step + (step - barW) / 2;
            let acc = 0;
            const segs = series
              .map((s) => ({ s, v: d.values[s.key] ?? 0 }))
              .filter((p) => p.v > 0);
            return (
              <g key={d.key} opacity={hover === null || hover === i ? 1 : 0.5}>
                {segs.map(({ s, v }, j) => {
                  const y0 = y(acc);
                  acc += v;
                  const y1 = y(acc);
                  const h = Math.max(0, y0 - y1 - (j > 0 ? 2 : 0));
                  const top = j === segs.length - 1;
                  return top ? (
                    <path key={s.key} d={roundedTop(x, y1, barW, h)} fill={s.color} />
                  ) : (
                    <rect key={s.key} x={x} y={y1} width={barW} height={h} fill={s.color} />
                  );
                })}
                {i === peak && totals[i] > 0 && (
                  <text x={x + barW / 2} y={y(totals[i]) - 4} textAnchor="middle" fontSize="9" fill="var(--color-foreground-muted)">
                    {totals[i]}
                  </text>
                )}
                {i % labelEvery === 0 && (
                  <text x={L + i * step + step / 2} y={H - 7} textAnchor="middle" fontSize="9" fill={MUTED}>
                    {d.label}
                  </text>
                )}
                <rect
                  x={L + i * step}
                  y={T}
                  width={step}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.full}: ${totals[i]} ${unit}`}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="outline-none"
                />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tip left={`${((L + hover * step + step / 2) / W) * 100}%`}>
            <p className="mb-1 text-foreground-muted">{data[hover].full}</p>
            <TipRow label="Total" value={`${totals[hover]} ${unit}`} />
            {series.length > 1 &&
              series.map((s) => <TipRow key={s.key} color={s.color} label={s.label} value={data[hover].values[s.key] ?? 0} />)}
          </Tip>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.full}</td>
              {series.map((s) => (
                <td key={s.key}>{d.values[s.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// ------------------------------------------------------------------ horizontal bars

export function HBars({
  title,
  rows,
  color = "var(--color-accent)",
  format = (n: number) => String(n),
  detail,
}: {
  title: string;
  rows: { key: string; label: string; value: number; sub?: string }[];
  color?: string;
  format?: (n: number) => string;
  detail?: (key: string) => ReactNode;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <figure>
      <ul className="flex flex-col gap-2" aria-label={title}>
        {rows.map((r) => (
          <li
            key={r.key}
            tabIndex={0}
            onMouseEnter={() => setHover(r.key)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(r.key)}
            onBlur={() => setHover(null)}
            className="relative grid grid-cols-[minmax(6rem,10rem)_1fr_auto] items-center gap-3 rounded-sm text-xs outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span className="truncate text-foreground-muted" title={r.label}>
              {r.label}
            </span>
            <span className="h-3">
              <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="block h-3 w-full" aria-hidden>
                <path
                  d={roundedRight(0, 0, Math.max(0.5, (r.value / max) * 100), 12)}
                  fill={color}
                  opacity={hover === null || hover === r.key ? 1 : 0.55}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
            <span className="min-w-[3rem] text-right tabular-nums text-foreground">
              {format(r.value)}
              {r.sub && <span className="ml-1 text-foreground-subtle">{r.sub}</span>}
            </span>
            {hover === r.key && detail && (
              <Tip left="50%" top={-6}>
                {detail(r.key)}
              </Tip>
            )}
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.label}</th>
              <td>{format(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// ------------------------------------------------------------------ funnel

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <figure>
      <ol className="flex flex-col gap-1.5">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const conv = prev ? Math.round((s.value / prev) * 100) : null;
          return (
            <li
              key={s.label}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="relative grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 rounded-sm text-xs outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <span className="text-foreground-muted">{s.label}</span>
              <span className="h-4">
                <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="block h-4 w-full" aria-hidden>
                  <rect width="100" height="16" rx="2" fill="var(--color-border)" opacity="0.35" />
                  {s.value > 0 && (
                    <path d={roundedRight(0, 0, Math.max(0.8, (s.value / top) * 100), 16)} fill="var(--color-accent)" opacity={hover === null || hover === i ? 1 : 0.55} />
                  )}
                </svg>
              </span>
              <span className="text-right tabular-nums text-foreground">
                {s.value}
                <span className="ml-1 text-foreground-subtle">{i === 0 ? "" : `${Math.round((s.value / top) * 100)}%`}</span>
              </span>
              {hover === i && (
                <Tip left="55%" top={-8}>
                  <p className="mb-1 text-foreground-muted">{s.label}</p>
                  <TipRow label="Leads" value={s.value} />
                  <TipRow label="Of all leads" value={`${Math.round((s.value / top) * 100)}%`} />
                  {conv !== null && <TipRow label="From previous step" value={`${conv}%`} />}
                </Tip>
              )}
            </li>
          );
        })}
      </ol>
      <table className="sr-only">
        <caption>Lead funnel</caption>
        <tbody>
          {steps.map((s) => (
            <tr key={s.label}>
              <th scope="row">{s.label}</th>
              <td>{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// ------------------------------------------------------------------ stacked horizontal bar

export function StackedBars({
  rows,
  groups,
}: {
  rows: { key: string; label: ReactNode; name: string; values: Record<string, number> }[];
  groups: { key: string; label: string; color: string }[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const totals = rows.map((r) => groups.reduce((t, g) => t + (r.values[g.key] ?? 0), 0));
  const max = Math.max(1, ...totals);
  return (
    <figure>
      <Legend items={groups} />
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((r, i) => {
          const total = totals[i];
          const segs = groups.filter((g) => (r.values[g.key] ?? 0) > 0);
          let x = 0;
          return (
            <li
              key={r.key}
              tabIndex={0}
              onMouseEnter={() => setHover(r.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(r.key)}
              onBlur={() => setHover(null)}
              className="relative grid grid-cols-[minmax(6rem,9rem)_1fr_2.5rem] items-center gap-3 rounded-sm text-xs outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <span className="truncate text-foreground-muted">{r.label}</span>
              <span className="h-3.5">
                <svg viewBox="0 0 1000 14" preserveAspectRatio="none" className="block h-3.5 w-full" aria-hidden>
                  {segs.map((g, j) => {
                    const w = ((r.values[g.key] ?? 0) / max) * 1000;
                    const gx = x;
                    x += w;
                    const drawW = Math.max(1, w - (j < segs.length - 1 ? 4 : 0));
                    return j === segs.length - 1 ? (
                      <path key={g.key} d={roundedRight(gx, 0, drawW, 14)} fill={g.color} />
                    ) : (
                      <rect key={g.key} x={gx} width={drawW} height="14" fill={g.color} />
                    );
                  })}
                </svg>
              </span>
              <span className="text-right tabular-nums text-foreground">{total}</span>
              {hover === r.key && (
                <Tip left="55%" top={-8}>
                  <p className="mb-1 text-foreground-muted">{r.name}</p>
                  {groups.map((g) => (
                    <TipRow key={g.key} color={g.color} label={g.label} value={r.values[g.key] ?? 0} />
                  ))}
                </Tip>
              )}
            </li>
          );
        })}
      </ul>
      <table className="sr-only">
        <caption>Open deals by stage</caption>
        <thead>
          <tr>
            <th scope="col">Rep</th>
            {groups.map((g) => (
              <th key={g.key} scope="col">
                {g.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row">{r.name}</th>
              {groups.map((g) => (
                <td key={g.key}>{r.values[g.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** A thin meter: share of a whole, with the value labelled beside it. */
export function Meter({ value, max, className }: { value: number; max: number; className?: string }) {
  const p = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className={cn("inline-flex h-1.5 w-16 overflow-hidden rounded-full bg-border", className)} aria-hidden>
      <span className="h-full rounded-full bg-accent" style={{ width: `${p}%` }} />
    </span>
  );
}
