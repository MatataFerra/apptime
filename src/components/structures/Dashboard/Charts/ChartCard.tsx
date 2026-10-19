import type { ReactNode } from "react";

/** Shared frame for the dashboard charts: title, a headline figure and the plot. */
function ChartCard({
  title,
  subtitle,
  figure,
  legend,
  children,
}: {
  title: string;
  subtitle?: string;
  figure?: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
          {subtitle ? <p className="text-[0.8125rem] text-ink-muted">{subtitle}</p> : null}
        </div>
        {figure}
      </header>
      {legend}
      {children}
    </section>
  );
}

export function SeriesKey({
  items,
}: {
  items: { label: string; color: string; value?: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-[0.8125rem] text-ink-muted">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[3px]"
            style={{ background: item.color }}
          />
          {item.label}
          {item.value ? (
            <span className="font-semibold text-ink tabular-nums">{item.value}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export const SERIES = {
  hourly: { label: "Per hour", color: "var(--color-series-hourly)" },
  production: { label: "Per piece", color: "var(--color-series-production)" },
} as const;

export default ChartCard;
