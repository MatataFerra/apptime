"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesPoint } from "@/services/Summary/history";

import { ChartCard, ChartTooltip, compactMoney, Legend, SERIES } from "./parts";

/** How each kind of income moved month to month: two lines, one axis. */
function MonthlyTrend({ data }: { data: SeriesPoint[] }) {
  return (
    <ChartCard title="Month by month" subtitle="Hourly and per piece earnings, last 6 months">
      <Legend />
      <div className="h-52 w-full" role="img" aria-label="Monthly earnings by type, last 6 months">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
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
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
              content={<ChartTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, fill: s.color, stroke: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: s.color, stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default MonthlyTrend;
