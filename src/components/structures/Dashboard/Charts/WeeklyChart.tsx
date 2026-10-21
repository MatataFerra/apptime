"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  type RectangleProps,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { WeekPoint } from "@/services/History";
import { formatMoneyCompact } from "@/services/Summary";

import useMoney from "@/hooks/useMoney";

import ChartCard, { SERIES, SeriesKey } from "./ChartCard";

function WeekTooltip({
  active,
  payload,
  currency,
}: {
  currency: string;
  active?: boolean;
  payload?: { payload: WeekPoint }[];
}) {
  const money = useMoney(currency);
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const total = point.hourly + point.production;

  return (
    <div className="min-w-40 rounded-xl border border-border bg-surface px-3 py-2.5 text-[0.8125rem] shadow-float">
      <p className="mb-1.5 font-semibold text-ink">Week of {point.label}</p>
      {(["hourly", "production"] as const).map((kind) => (
        <p key={kind} className="flex items-center justify-between gap-4 text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px]" style={{ background: SERIES[kind].color }} />
            {SERIES[kind].label}
          </span>
          <span className="text-ink tabular-nums">{money(point[kind])}</span>
        </p>
      ))}
      <p className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-semibold text-ink">
        Total <span className="tabular-nums">{money(total)}</span>
      </p>
    </div>
  );
}

/** Earned per week, stacked by kind. Rounded only at the top of each column. */
function WeeklyChart({ data, currency }: { data: WeekPoint[]; currency: string }) {
  const money = useMoney(currency);
  const totals = data.reduce(
    (acc, w) => ({ hourly: acc.hourly + w.hourly, production: acc.production + w.production }),
    { hourly: 0, production: 0 }
  );
  const total = totals.hourly + totals.production;
  const hasProduction = totals.production > 0;

  return (
    <ChartCard
      title="Earned per week"
      subtitle={`Last ${data.length} weeks`}
      figure={
        <span className="figure text-[1.75rem] leading-none text-ink">
          {money(total, { cents: false })}
        </span>
      }
      legend={
        <SeriesKey
          items={[
            { ...SERIES.hourly, value: money(totals.hourly, { cents: false }) },
            ...(hasProduction
              ? [{ ...SERIES.production, value: money(totals.production, { cents: false }) }]
              : []),
          ]}
        />
      }
    >
      <div
        className="h-52 w-full"
        role="img"
        aria-label={`Weekly earnings, ${money(total)} in total`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={18}
              tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickCount={4}
              tickFormatter={(value: number) => formatMoneyCompact(value, currency)}
              tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-sunken)" }}
              content={<WeekTooltip currency={currency} />}
            />
            <Bar
              dataKey="hourly"
              stackId="w"
              fill={SERIES.hourly.color}
              stroke="var(--color-surface)"
              strokeWidth={1}
              isAnimationActive={false}
              // Rounded top only when nothing is stacked above it.
              shape={(props: unknown) => {
                const bar = props as RectangleProps & { payload?: WeekPoint };
                return <Rectangle {...bar} radius={bar.payload?.production ? 0 : [4, 4, 0, 0]} />;
              }}
            />
            <Bar
              dataKey="production"
              stackId="w"
              fill={SERIES.production.color}
              stroke="var(--color-surface)"
              strokeWidth={1}
              isAnimationActive={false}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default WeeklyChart;
