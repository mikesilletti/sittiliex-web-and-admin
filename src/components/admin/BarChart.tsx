"use client";

import { useState } from "react";

export interface BarDatum {
  label: string; // short x-axis label, e.g. "12"
  fullLabel: string; // tooltip label, e.g. "Jul 12"
  value: number;
}

const W = 600;
const H = 170;
const PAD_LEFT = 30;
const PAD_BOTTOM = 22;
const PAD_TOP = 14;

/** Round a max up to a clean axis number (1/2/5 × 10^n). */
function niceMax(n: number) {
  if (n <= 4) return Math.max(n, 4);
  const pow = 10 ** Math.floor(Math.log10(n));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= n) return m * pow;
  }
  return 10 * pow;
}

export function BarChart({ title, unit, data }: { title: string; unit: string; data: BarDatum[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const plotW = W - PAD_LEFT;
  const plotH = H - PAD_BOTTOM - PAD_TOP;
  const step = plotW / data.length;
  const barW = Math.min(24, Math.max(6, step - 8));
  const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const gridValues = [max / 2, max];

  function barPath(x: number, y: number, w: number, h: number) {
    // 4px rounded data-end, square at the baseline.
    const r = Math.min(4, w / 2, h);
    const baseline = y + h;
    return `M${x},${baseline} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${baseline} Z`;
  }

  return (
    <figure className="rounded-md border border-border bg-background-raised p-4">
      <figcaption className="text-xs font-medium text-foreground">{title}</figcaption>
      {total === 0 && <p className="mt-1 text-[11px] text-foreground-subtle">Nothing yet in this period.</p>}

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full"
          role="img"
          aria-label={`${title}: bar chart. Data table follows.`}
          onMouseLeave={() => setHover(null)}
        >
          {/* recessive hairline gridlines + clean tick values */}
          {gridValues.map((v) => {
            const y = PAD_TOP + plotH * (1 - v / max);
            return (
              <g key={v}>
                <line
                  x1={PAD_LEFT}
                  x2={W}
                  y1={y}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_LEFT - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="var(--color-foreground-subtle)"
                >
                  {v}
                </text>
              </g>
            );
          })}
          <line
            x1={PAD_LEFT}
            x2={W}
            y1={PAD_TOP + plotH}
            y2={PAD_TOP + plotH}
            stroke="var(--color-border)"
            strokeWidth="1"
          />

          {data.map((d, i) => {
            const h = max === 0 ? 0 : (d.value / max) * plotH;
            const x = PAD_LEFT + i * step + (step - barW) / 2;
            const y = PAD_TOP + plotH - h;
            return (
              <g key={d.fullLabel}>
                {d.value > 0 && (
                  <path d={barPath(x, y, barW, h)} fill="var(--color-accent)" opacity={hover === null || hover === i ? 1 : 0.55} />
                )}
                {/* selective direct label: the max only (tooltips carry the rest) */}
                {i === maxIndex && d.value > 0 && (
                  <text
                    x={x + barW / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--color-foreground-muted)"
                  >
                    {d.value}
                  </text>
                )}
                {i % 2 === 0 && (
                  <text
                    x={PAD_LEFT + i * step + step / 2}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--color-foreground-subtle)"
                  >
                    {d.label}
                  </text>
                )}
                {/* full-column hit target so zero-days are hoverable too */}
                <rect
                  x={PAD_LEFT + i * step}
                  y={PAD_TOP}
                  width={step}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
              </g>
            );
          })}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-1 rounded-sm border border-border bg-background-overlay px-2 py-1 text-[11px] text-foreground shadow-md"
            style={{
              left: `${((PAD_LEFT + hover * step + step / 2) / W) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {data[hover].fullLabel} · {data[hover].value}{" "}
            {data[hover].value === 1 ? unit.replace(/s$/, "") : unit}
          </div>
        )}
      </div>

      {/* accessible fallback */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.fullLabel}>
              <td>{d.fullLabel}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
