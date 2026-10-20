"use client";

import { useMemo } from "react";

import { format, subMonths } from "date-fns";
import { CalendarDays, Clock3, Layers, type LucideIcon, TrendingUp } from "lucide-react";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";
import { compareWithPreviousMonth } from "@/services/Summary";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";

type Props = {
  params: LocaleParams;
};

function Stat({
  icon: Icon,
  theme,
  value,
  label,
  small,
}: {
  icon: LucideIcon;
  theme: ModuleTheme;
  value: string | number;
  label: string;
  small?: boolean;
}) {
  const colors = MODULE_THEMES[theme];

  return (
    <div className="flex flex-col gap-3.5 rounded-[18px] border border-border bg-surface p-3.5">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-[10px]",
          colors.soft,
          colors.ink
        )}
      >
        <Icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className={cn("figure leading-none", small ? "text-xl" : "text-[1.875rem]")}>
          {value}
        </span>
        <span className="text-[0.8125rem] text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

/** Month earnings against last month, plus all-time stats. */
function DashboardStats({ params }: Props) {
  const money = useMoney();
  const { hourly: hourlies, production: productions, isLoading } = useShiftsInCurrency();

  const stats = useMemo(
    () =>
      hourlies
        ? new Dashboard(hourlies, productions ?? []).dashboardData()
        : {
            shiftsLen: 0,
            hoursWorked: 0,
            averageHoursWorkedPerDay: 0,
            lastDayRegistered: "",
          },
    [hourlies, productions]
  );

  const month = useMemo(
    () => compareWithPreviousMonth(hourlies, productions),
    [hourlies, productions]
  );

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Skeleton classes="col-span-2 h-28 rounded-[18px]" />
        <Skeleton classes="h-28 rounded-[18px]" />
        <Skeleton classes="h-28 rounded-[18px]" />
      </div>
    );
  }

  const lastDay = new Date(stats.lastDayRegistered);
  const lastDayLabel = lastDay.valueOf()
    ? new DateHumanizer("short").humanizeDate(lastDay, { locale: params.locale })
    : "None yet";
  const previousMonth = format(subMonths(new Date(), 1), "MMMM");
  const change = month.change;

  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <section className="col-span-2 flex flex-col gap-3 rounded-[18px] bg-surface-inverse p-4 text-ink-inverse">
        <span className="text-[0.8125rem] text-ink-inverse/70">
          Earned in {format(new Date(), "MMMM")}
        </span>
        <span className="figure text-[3.25rem] leading-[0.9] text-live">
          {money(month.current.earned)}
        </span>
        {month.previousFull.earned > 0 ? (
          <div className="flex flex-col gap-2.5 border-t border-ink-inverse/15 pt-3">
            <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
              <span className="text-ink-inverse/70">
                {previousMonth}: {money(month.previousFull.earned)}
              </span>
              <span className="font-semibold">
                {(month.shareOfPrevious ?? 0) >= 100
                  ? "Already past it"
                  : `${month.shareOfPrevious}% of it so far`}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-ink-inverse/12"
              role="progressbar"
              aria-label={`This month compared with ${previousMonth}`}
              aria-valuenow={Math.min(100, month.shareOfPrevious ?? 0)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-live"
                style={{ width: `${Math.min(100, month.shareOfPrevious ?? 0)}%` }}
              />
            </div>
            {change !== null ? (
              <span
                className={cn(
                  "flex items-center gap-1 text-[0.8125rem] font-semibold",
                  change >= 0 ? "text-live" : "text-production-bright"
                )}
              >
                <TrendingUp
                  className={cn("size-4", change < 0 && "-scale-y-100")}
                  aria-hidden="true"
                />
                {change >= 0 ? "+" : ""}
                {change}% vs {previousMonth} 1 to {new Date().getDate()}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-[0.8125rem] text-ink-inverse/70">
            No earnings in {previousMonth} to compare with.
          </span>
        )}
      </section>
      <Stat icon={Clock3} theme="track" value={`${stats.hoursWorked}h`} label="hours worked" />
      <Stat icon={Layers} theme="production" value={stats.shiftsLen} label="shifts saved" />
      <Stat
        icon={TrendingUp}
        theme="insight"
        value={`${stats.averageHoursWorkedPerDay}h`}
        label="average per day"
      />
      <Stat icon={CalendarDays} theme="fast" value={lastDayLabel} label="last shift" small />
    </div>
  );
}

export default DashboardStats;
