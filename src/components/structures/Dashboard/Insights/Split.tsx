"use client";

import { formatMoney } from "@/services/Summary";

import { SERIES } from "./parts";

type Props = { hourly: number; production: number; hourlyShare: number; productionShare: number };

/** Where the money came from, all time: one bar split by type (instead of a pie). */
function Split({ hourly, production, hourlyShare, productionShare }: Props) {
  const parts = [
    { ...SERIES[0], value: hourly, share: hourlyShare },
    { ...SERIES[1], value: production, share: productionShare },
  ].filter((p) => p.share > 0);

  return (
    <section className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-4">
      <h3 className="text-[0.9375rem] font-semibold text-ink">Where your pay comes from</h3>
      <div
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${p.share}%`).join(", ")}
      >
        {parts.map((p) => (
          <span
            key={p.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${p.share}%`, background: p.color }}
          />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {[
          { ...SERIES[0], value: hourly, share: hourlyShare },
          { ...SERIES[1], value: production, share: productionShare },
        ].map((p) => (
          <div key={p.key} className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{ background: p.color }}
              />
              {p.label}
            </dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="figure text-[1.375rem] text-ink">{p.share}%</span>
              <span className="text-[0.8125rem] text-ink-muted tabular-nums">
                {formatMoney(p.value, { cents: false })}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default Split;
