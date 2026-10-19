"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesPoint } from "@/services/Summary/history";

import { ChartCard, ChartTooltip, compactMoney, Legend } from "./parts";

type BarShapeProps = React.ComponentProps<typeof Rectangle> & { payload?: SeriesPoint };

/**
 * Rounded only at the data end (the top of the stack), square at the
 * baseline; a 2px surface stroke is the gap between stacked segments.
 */
function segment(key: "hourly" | "production") {
  return function Segment(props: unknown) {
    const p = props as BarShapeProps;
    const isTop = key === "production" || !p.payload?.production;
    return (
      <Rectangle
        {...p}
        radius={isTop ? [4, 4, 0, 0] : 0}
        stroke="var(--surface)"
        strokeWidth={key === "production" ? 2 : 0}
      />
    );
  };
}

/** Weekly earnings, stacked by type, for the last 12 weeks. */
function WeeklyChart({ data }: { data: SeriesPoint[] }) {
  const totals = data.reduce(
    (acc, p) => ({ hourly: acc.hourly + p.hourly, production: acc.production + p.production }),
    { hourly: 0, production: 0 }
  );

  return (
    <ChartCard title="Earnings by week" subtitle="Last 12 weeks">
      <Legend totals={totals} />
      <div className="h-52 w-full" role="img" aria-label="Weekly earnings by type, last 12 weeks">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={2}
              tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={compactMoney}
              tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-sunken)" }}
              content={<ChartTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="hourly"
              stackId="pay"
              fill="var(--chart-1)"
              maxBarSize={24}
              shape={segment("hourly")}
              isAnimationActive={false}
            />
            <Bar
              dataKey="production"
              stackId="pay"
              fill="var(--chart-2)"
              maxBarSize={24}
              shape={segment("production")}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default WeeklyChart;
