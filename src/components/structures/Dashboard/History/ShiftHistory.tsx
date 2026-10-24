"use client";

import { useEffect, useState } from "react";

import type { Hourly, Production } from "@prisma/client";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  countByEmployer,
  countDays,
  DAYS_PER_PAGE,
  type EmployerFilter as EmployerFilterValue,
  entriesForDays,
  filterEntries,
  groupByMonth,
  historyEntries,
  type HistoryEntry,
  type MonthGroup,
  type ShiftKind,
} from "@/services/History";
import { formatHours } from "@/services/Summary";

import EmployerFilter from "@/components/structures/Dashboard/History/EmployerFilter";
import {
  CheckIcon,
  keyOf,
  SelectionActions,
  SelectionHeader,
  selectionState,
} from "@/components/structures/Dashboard/History/Selection";
import Content from "@/components/structures/Dashboard/Table/Dialog/Content";
import TableDialog from "@/components/structures/Dashboard/Table/Dialog/Dialog";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useDashboard from "@/hooks/useDashboard";
import useDateLocale from "@/hooks/useDateLocale";
import useEmployers from "@/hooks/useEmployers";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney, { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";
import { useHistorySelection } from "@/store/useHistorySelection";

type Filter = "all" | ShiftKind;

const FILTERS: Filter[] = ["all", "hourly", "production"];

type Translate = ReturnType<typeof useTranslations<"dashboard.history">>;

function detail(entry: HistoryEntry, money: (value: number) => string, t: Translate) {
  if (entry.kind === "hourly") {
    const rate = (entry.shift as Hourly).hourValue;
    return t("hourly_detail", { hours: formatHours(entry.minutes), rate: money(rate) });
  }
  const { itemQuantity, itemValue } = entry.shift as Production;
  return t("pieces_detail", { count: itemQuantity ?? 0, value: money(itemValue ?? 0) });
}

/** A row while selecting: tapping it checks it, the date badge becomes the checkbox. */
function SelectableRow({ entry }: { entry: HistoryEntry }) {
  const format$ = useMoney();
  const t = useTranslations("dashboard.history");
  const locale = useDateLocale();
  const { byId } = useEmployers();
  const checked = useHistorySelection((state) => state.keys.has(keyOf(entry)));
  const toggle = useHistorySelection((state) => state.toggle);
  const employer = entry.employerId !== null ? byId.get(entry.employerId) : undefined;
  const isHourly = entry.kind === "hourly";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-testid="history-row"
      onClick={() => toggle(keyOf(entry))}
      className={cn(
        "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
        checked ? "bg-accent-soft" : "hover:bg-surface-sunken focus-visible:bg-surface-sunken"
      )}
    >
      <span className="flex w-12 shrink-0 items-center justify-center py-1.5">
        <CheckIcon state={checked ? "all" : "none"} classes="size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[0.9375rem] font-semibold text-ink">
          {entry.name || (isHourly ? t("hourly_shift") : t("piece_shift"))}
        </span>
        <span className="truncate text-[0.8125rem] text-ink-muted">
          <span className={isHourly ? "text-track-ink" : "text-production-ink"}>
            {format(entry.date, "EEE d", { locale })}
          </span>{" "}
          · {employer?.name ?? (isHourly ? t("filters.hourly") : t("filters.production"))}
        </span>
      </span>
      <span className="shrink-0 text-[0.9375rem] font-semibold text-ink tabular-nums">
        {format$(entry.earned, { currency: entry.currency })}
      </span>
    </button>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const format$ = useMoney();
  const t = useTranslations("dashboard.history");
  const locale = useDateLocale();
  const { byId } = useEmployers();
  const employer = entry.employerId !== null ? byId.get(entry.employerId) : undefined;
  // Each shift in its own currency.
  function money(value: number) {
    return format$(value, { currency: entry.currency });
  }
  const hourlyStore = useDashHourlyStore();
  const productionStore = useDashProductionStore();
  const store = entry.kind === "hourly" ? hourlyStore : productionStore;
  const isHourly = entry.kind === "hourly";

  return (
    <TableDialog
      title={isHourly ? t("hourly_shift") : t("piece_shift")}
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
            {format(entry.date, "EEE", { locale })}
          </span>
          <span className="figure text-[1.375rem] leading-none">{format(entry.date, "d")}</span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[0.9375rem] font-semibold text-ink">
            {entry.name || (isHourly ? t("hourly_shift") : t("piece_shift"))}
          </span>
          <span className="truncate text-[0.8125rem] text-ink-muted">
            {employer?.name ?? (isHourly ? t("filters.hourly") : t("filters.production"))} ·{" "}
            {detail(entry, money, t)}
          </span>
          {entry.holiday ? (
            <span className="mt-0.5 w-fit rounded-full bg-fast-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-fast-ink">
              {entry.holiday === "worked" ? t("holiday_worked") : t("holiday_off")}
            </span>
          ) : null}
        </span>

        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[0.9375rem] font-semibold text-ink tabular-nums">
            {money(entry.earned)}
          </span>
          {entry.afterTaxes < entry.earned - 0.005 ? (
            <span className="text-xs text-ink-muted tabular-nums">
              {t("net", { amount: money(entry.afterTaxes) })}
            </span>
          ) : null}
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </button>
    </TableDialog>
  );
}

/**
 * One month: the shifts of its last 7 worked days, and a button that adds
 * 7 more each time. The header totals always cover the whole month.
 */
function MonthSection({ month }: { month: MonthGroup }) {
  const money = useMoney();
  const t = useTranslations("dashboard.history");
  const ts = useTranslations("dashboard.selection");
  const [days, setDays] = useState(DAYS_PER_PAGE);
  const selecting = useHistorySelection((state) => state.active);
  const keys = useHistorySelection((state) => state.keys);
  const setMany = useHistorySelection((state) => state.setMany);
  const monthState = selectionState(month.entries, keys);
  const totalDays = countDays(month.entries);
  const visible = entriesForDays(month.entries, days);
  const hidden = month.entries.length - visible.length;

  return (
    <section aria-label={month.label} className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between px-1">
        {selecting ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={monthState === "all" ? true : monthState === "some" ? "mixed" : false}
            aria-label={ts("select_month", { month: month.label })}
            onClick={() => setMany(month.entries.map(keyOf), monthState !== "all")}
            className="-ml-1 flex items-center gap-1.5 rounded-md px-1 text-sm font-semibold text-ink"
          >
            <CheckIcon state={monthState} />
            {month.label}
          </button>
        ) : (
          <h3 className="text-sm font-semibold text-ink">{month.label}</h3>
        )}
        <span className="text-sm text-ink-muted tabular-nums">
          {t("shifts", { count: month.entries.length })} ·{" "}
          {month.totals.map((total, i) => (
            <span key={total.currency} className="font-semibold text-ink">
              {i > 0 ? " + " : ""}
              {money(total.amount, { currency: total.currency })}
            </span>
          ))}
        </span>
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <ul className="divide-y divide-border">
          {visible.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`}>
              {selecting ? <SelectableRow entry={entry} /> : <HistoryRow entry={entry} />}
            </li>
          ))}
        </ul>
        {totalDays > DAYS_PER_PAGE ? (
          <div className="flex border-t border-border">
            {hidden > 0 ? (
              <button
                type="button"
                data-testid="history-more"
                onClick={() => setDays((d) => d + DAYS_PER_PAGE)}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 text-sm font-medium text-accent transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken"
              >
                {t("show_more", { count: hidden })}
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            ) : null}
            {days > DAYS_PER_PAGE ? (
              <button
                type="button"
                onClick={() => setDays(DAYS_PER_PAGE)}
                className={cn(
                  "flex h-11 items-center justify-center gap-1.5 px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken",
                  hidden > 0 ? "border-l border-border" : "flex-1"
                )}
              >
                {t("show_less")}
                <ChevronUp className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Every saved shift, grouped by month: what, when, how much and after tax.
 * Each month starts with its last 7 worked days.
 * Tap a shift for the details, to edit or to delete it.
 */
function ShiftHistory() {
  const currency = useCurrency();
  const t = useTranslations("dashboard.history");
  const locale = useDateLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [employer, setEmployer] = useState<EmployerFilterValue>("all");
  const { isDateFiltered } = useDashboard();
  const { data: hourlyData, isLoading: loadingHourly } = useHourlyShifts();
  const { data: productionData, isLoading: loadingProduction } = useProductionShifts();
  const { hourly, setInitialHourlies } = useDashHourlyStore();
  const { productions, setInitialProductions } = useDashProductionStore();
  const selecting = useHistorySelection((state) => state.active);

  // The date picker filters these stores; keep them in sync with the data otherwise.
  useEffect(() => {
    if (!isDateFiltered && hourlyData) setInitialHourlies(hourlyData);
  }, [hourlyData, isDateFiltered, setInitialHourlies]);
  useEffect(() => {
    if (!isDateFiltered && productionData) setInitialProductions(productionData);
  }, [productionData, isDateFiltered, setInitialProductions]);

  if (loadingHourly || loadingProduction) {
    return <Skeleton classes="h-64 w-full rounded-xl" />;
  }

  const all = historyEntries(hourly, productions);
  const entries = filterEntries(all, { kind: filter, employer });
  const months = groupByMonth(entries, currency, locale);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={t("filter_label")} className="flex shrink-0 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                filter === f
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
              )}
            >
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
        <EmployerFilter
          value={employer}
          onChange={setEmployer}
          counts={countByEmployer(filterEntries(all, { kind: filter }))}
        />
      </div>
      {selecting ? <SelectionHeader visible={entries} all={all} /> : null}

      {months.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong p-6 text-center text-sm text-ink-muted">
          {employer !== "all" && all.length > 0
            ? t("empty_employer")
            : isDateFiltered
              ? t("empty_filtered")
              : t("empty")}
        </p>
      ) : (
        months.map((month) => (
          <MonthSection key={`${filter}-${employer}-${month.key}`} month={month} />
        ))
      )}

      {selecting && all.length > 0 ? <SelectionActions entries={all} /> : null}
    </div>
  );
}

export default ShiftHistory;
