"use client";

import { useEffect, useState } from "react";

import type { Hourly, Production } from "@prisma/client";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";

import {
  groupByMonth,
  type HistoryEntry,
  historyEntries,
  type ShiftKind,
} from "@/services/History";
import { formatHours, formatMoney } from "@/services/Summary";

import Content from "@/components/structures/Dashboard/Table/Dialog/Content";
import TableDialog from "@/components/structures/Dashboard/Table/Dialog/Dialog";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useDashboard from "@/hooks/useDashboard";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";

type Filter = "all" | ShiftKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hourly", label: "Per hour" },
  { value: "production", label: "Per piece" },
];

function detail(entry: HistoryEntry) {
  if (entry.kind === "hourly") {
    const rate = (entry.shift as Hourly).hourValue;
    return `${formatHours(entry.minutes)} · ${formatMoney(rate)}/h`;
  }
  const { itemQuantity, itemValue } = entry.shift as Production;
  return `${itemQuantity ?? 0} pieces × ${formatMoney(itemValue ?? 0)}`;
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const hourlyStore = useDashHourlyStore();
  const productionStore = useDashProductionStore();
  const store = entry.kind === "hourly" ? hourlyStore : productionStore;
  const isHourly = entry.kind === "hourly";

  return (
    <TableDialog
      title={isHourly ? "Hourly shift" : "Per piece shift"}
      shift={entry.shift as Hourly | Production}
      type={entry.kind}
      delete={store.delete}
      reset={store.reset}
      content={<Content shift={entry.shift as Hourly | Production} />}
    >
      <button
        type="button"
        data-testid="history-row"
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken"
      >
        <span
          className={cn(
            "flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5",
            isHourly ? "bg-track-soft text-track-ink" : "bg-production-soft text-production-ink"
          )}
        >
          <span className="text-[0.6875rem] font-semibold uppercase">
            {format(entry.date, "EEE")}
          </span>
          <span className="figure text-[1.375rem] leading-none">{format(entry.date, "d")}</span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[0.9375rem] font-semibold text-ink">
            {entry.name || (isHourly ? "Hourly shift" : "Per piece shift")}
          </span>
          <span className="truncate text-[0.8125rem] text-ink-muted">
            {isHourly ? "Per hour" : "Per piece"} · {detail(entry)}
          </span>
          {entry.holiday ? (
            <span className="mt-0.5 w-fit rounded-full bg-fast-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-fast-ink">
              {entry.holiday === "worked" ? "Holiday, worked 1.5×" : "Holiday, day off"}
            </span>
          ) : null}
        </span>

        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[0.9375rem] font-semibold text-ink tabular-nums">
            {formatMoney(entry.earned)}
          </span>
          {entry.afterTaxes < entry.earned - 0.005 ? (
            <span className="text-xs text-ink-muted tabular-nums">
              {formatMoney(entry.afterTaxes)} net
            </span>
          ) : null}
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </button>
    </TableDialog>
  );
}

/**
 * Every saved shift, grouped by month: what, when, how much and after tax.
 * Tap a shift for the details, to edit or to delete it.
 */
function ShiftHistory() {
  const [filter, setFilter] = useState<Filter>("all");
  const { isDateFiltered } = useDashboard();
  const { data: hourlyData, isLoading: loadingHourly } = useHourlyShifts();
  const { data: productionData, isLoading: loadingProduction } = useProductionShifts();
  const { hourly, setInitialHourlies } = useDashHourlyStore();
  const { productions, setInitialProductions } = useDashProductionStore();

  // The date picker filters these stores; keep them in sync with the data otherwise.
  useEffect(() => {
    if (!isDateFiltered && hourlyData) setInitialHourlies(hourlyData);
  }, [hourlyData, isDateFiltered, setInitialHourlies]);
  useEffect(() => {
    if (!isDateFiltered && productionData) setInitialProductions(productionData);
  }, [productionData, isDateFiltered, setInitialProductions]);

  if (loadingHourly || loadingProduction) {
    return <Skeleton classes="h-64 w-full rounded-[20px]" />;
  }

  const entries = historyEntries(hourly, productions).filter(
    (e) => filter === "all" || e.kind === filter
  );
  const months = groupByMonth(entries);

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Shift type" className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {months.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border-strong p-6 text-center text-sm text-ink-muted">
          {isDateFiltered ? "No shifts in those dates." : "No shifts saved yet."}
        </p>
      ) : (
        months.map((month) => (
          <section key={month.key} aria-label={month.label} className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between px-1">
              <h3 className="text-sm font-semibold text-ink">{month.label}</h3>
              <span className="text-sm text-ink-muted tabular-nums">
                {month.entries.length} {month.entries.length === 1 ? "shift" : "shifts"} ·{" "}
                <span className="font-semibold text-ink">{formatMoney(month.earned)}</span>
              </span>
            </header>
            <ul className="divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-surface">
              {month.entries.map((entry) => (
                <li key={`${entry.kind}-${entry.id}`}>
                  <HistoryRow entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

export default ShiftHistory;
