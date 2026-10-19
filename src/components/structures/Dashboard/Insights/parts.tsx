"use client";

import type { ReactNode } from "react";

import { formatMoney } from "@/services/Summary";

/** Series identity: the hue lives on the mark (swatch), never on the text. */
export const SERIES = [
  { key: "hourly", label: "Hourly", color: "var(--chart-1)" },
  { key: "production", label: "Per piece", color: "var(--chart-2)" },
] as const;

export type SeriesKey = (typeof SERIES)[number]["key"];

export function compactMoney(value: number) {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 100) / 10}K`;
  return `$${Math.round(value)}`;
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-4">
      <header className="flex flex-col gap-0.5">
        <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="text-[0.8125rem] text-ink-muted">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function Legend({ totals }: { totals?: Partial<Record<SeriesKey, number>> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-muted">
      {SERIES.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[3px]"
            style={{ background: s.color }}
          />
          <span className="text-ink">{s.label}</span>
          {totals?.[s.key] !== undefined ? (
            <span className="tabular-nums">
              {formatMoney(totals[s.key] ?? 0, { cents: false })}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: { dataKey?: string | number; value?: number | string }[];
};

/** Hover readout: the period, each series with its swatch, and the total. */
export function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const values = Object.fromEntries(payload.map((p) => [p.dataKey, Number(p.value) || 0]));
  const total = SERIES.reduce((acc, s) => acc + (values[s.key] ?? 0), 0);

  return (
    <div className="min-w-36 rounded-xl border border-border bg-surface px-3 py-2.5 text-[0.8125rem] shadow-float">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      <ul className="flex flex-col gap-1">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span
                aria-hidden="true"
                className="size-2 rounded-[2px]"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
            <span className="text-ink tabular-nums">{formatMoney(values[s.key] ?? 0)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-semibold text-ink">
        <span>Total</span>
        <span className="tabular-nums">{formatMoney(total)}</span>
      </p>
    </div>
  );
}
