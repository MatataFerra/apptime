"use client";

import { useState } from "react";

import { formatMoney } from "@/services/Summary";
import { type AnyShift, groupByMonth, type MonthGroup } from "@/services/Summary/history";

import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";

import HistoryRow from "./Row";
import useDashShifts from "./useDashShifts";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "hourly", label: "Hourly" },
  { value: "production", label: "Per piece" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

const PAGE = 15;

/** The first `limit` shifts, keeping each month header with the shifts shown under it. */
function takeShifts(groups: MonthGroup[], limit: number) {
  const out: MonthGroup[] = [];
  let left = limit;
  for (const group of groups) {
    if (left <= 0) break;
    const shifts = group.shifts.slice(0, left);
    left -= shifts.length;
    out.push({ ...group, shifts });
  }
  return out;
}

/** Shift history grouped by month, newest first. Tap a shift for details. */
function HistoryList() {
  const { hourly, production, isLoading, isDateFiltered } = useDashShifts();
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton classes="h-10 w-full rounded-full" />
        <Skeleton classes="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  const shifts: AnyShift[] =
    filter === "hourly"
      ? hourly
      : filter === "production"
        ? production
        : [...hourly, ...production];
  const groups = groupByMonth(shifts);

  const visible = takeShifts(groups, limit);
  const total = groups.reduce((acc, g) => acc + g.shifts.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Show"
        className="flex gap-1.5 rounded-full bg-surface-sunken p-1"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => {
              setFilter(option.value);
              setLimit(PAGE);
            }}
            className={cn(
              "h-9 flex-1 rounded-full text-sm font-medium transition-colors",
              filter === option.value
                ? "bg-surface text-ink shadow-input"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border-strong px-4 py-10 text-center text-sm text-ink-muted">
          {isDateFiltered ? "No shifts in those dates." : "No shifts yet. Log one from Home."}
        </p>
      ) : (
        visible.map((group) => {
          const full = groups.find((g) => g.key === group.key);
          return (
            <section key={group.key} aria-label={group.label} className="flex flex-col gap-2">
              <header className="flex items-baseline justify-between px-1">
                <h3 className="text-[0.9375rem] font-semibold text-ink">{group.label}</h3>
                <span className="text-[0.8125rem] text-ink-muted tabular-nums">
                  {full?.shifts.length} {full?.shifts.length === 1 ? "shift" : "shifts"} ·{" "}
                  {formatMoney(full?.total ?? 0)}
                </span>
              </header>
              <ul className="divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-surface">
                {group.shifts.map((shift) => (
                  <li key={`${"itemValue" in shift ? "p" : "h"}-${shift.id}`}>
                    <HistoryRow shift={shift} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {total > limit ? (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="h-11 rounded-xl border border-border-strong bg-surface text-sm font-semibold text-ink hover:bg-surface-sunken"
        >
          Show more ({total - limit} left)
        </button>
      ) : null}
    </div>
  );
}

export default HistoryList;
