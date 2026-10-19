"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CumulativePoint } from "@/services/History";
import { formatMoney } from "@/services/Summary";

import ChartCard, { SERIES, SeriesKey } from "./ChartCard";

function compact(value: number) {
  return value >= 1000 ? `$${Math.round(value / 100) / 10}k` : `$${Math.round(value)}`;
}

function SeasonTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CumulativePoint }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="min-w-40 rounded-xl border border-border bg-surface px-3 py-2.5 text-[0.8125rem] shadow-float">
      <p className="mb-1.5 font-semibold text-ink">Up to {point.label}</p>
      {(["hourly", "production"] as const).map((kind) => (
        <p key={kind} className="flex items-center justify-between gap-4 text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: SERIES[kind].color }} />
            {SERIES[kind].label}
          </span>
          <span className="text-ink tabular-nums">{formatMoney(point[kind])}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Running totals of both kinds of income across the season, with how the
 * total splits between them on top.
 */
function SeasonChart({ data }: { data: CumulativePoint[] }) {
  const last = data.at(-1) ?? { hourly: 0, production: 0 };
  const total = last.hourly + last.production;
  const share = total > 0 ? Math.round((last.hourly / total) * 100) : 0;
  const both = last.hourly > 0 && last.production > 0;
  const points = data.map((p) => ({ ...p, t: p.date.valueOf() }));

  return (
    <ChartCard
      title="Your season so far"
      subtitle={data.length ? `Since ${data[0].label}` : undefined}
      figure={
        <span className="figure text-[1.75rem] leading-none text-ink">
          {formatMoney(total, { cents: false })}
        </span>
      }
      legend={
        <div className="flex flex-col gap-2.5">
          {both ? (
            <div
              className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
              role="img"
              aria-label={`${share}% per hour, ${100 - share}% per piece`}
            >
              <span
                className="rounded-l-full"
                style={{ width: `${share}%`, background: SERIES.hourly.color }}
              />
              <span
                className="flex-1 rounded-r-full"
                style={{ background: SERIES.production.color }}
              />
            </div>
          ) : null}
          <SeriesKey
            items={[
              {
                ...SERIES.hourly,
                value: both ? `${share}%` : formatMoney(last.hourly, { cents: false }),
              },
              ...(last.production > 0
                ? [
                    {
                      ...SERIES.production,
                      value: both
                        ? `${100 - share}%`
                        : formatMoney(last.production, { cents: false }),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      }
    >
      <div
        className="h-52 w-full"
        role="img"
        aria-label="Running total of your earnings over the season"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
            {/* Real time scale: days without shifts still take their space. */}
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t: number) => format(new Date(t), "d MMM")}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickCount={4}
              tickFormatter={compact}
              tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
              content={<SeasonTooltip />}
            />
            {(["hourly", "production"] as const)
              .filter((kind) => last[kind] > 0)
              .map((kind) => (
                <Line
                  key={kind}
                  type="stepAfter"
                  dataKey={kind}
                  stroke={SERIES[kind].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4.5, stroke: "var(--color-surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default SeasonChart;
