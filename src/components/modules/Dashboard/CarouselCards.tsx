"use client";

import { useMemo } from "react";

import { format, subMonths } from "date-fns";
import { CalendarDays, Clock3, Layers, type LucideIcon, TrendingUp } from "lucide-react";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";
import { compareWithPreviousMonth, formatMoney } from "@/services/Summary";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

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
  const { data: hourlies, isLoading: loadingHourly } = useHourlyShifts();
  const { data: productions, isLoading: loadingProduction } = useProductionShifts();

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

  if (loadingHourly || loadingProduction) {
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
      <section className="col-span-2 flex flex-col gap-4 rounded-[18px] bg-surface-inverse p-4 text-ink-inverse">
        <span className="text-[0.8125rem] text-ink-inverse/70">
          Earned in {format(new Date(), "MMMM")}
        </span>
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <span className="figure text-[3.25rem] leading-[0.9] text-live">
            {formatMoney(month.current.earned)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-[0.8125rem] font-semibold",
              change === null ? "text-ink-inverse/70" : change >= 0 ? "text-live" : "text-production-bright"
            )}
          >
            {change === null ? (
              `Nothing to compare in ${previousMonth}`
            ) : (
              <>
                <TrendingUp
                  className={cn("size-4", change < 0 && "-scale-y-100")}
                  aria-hidden="true"
                />
                {change >= 0 ? "+" : ""}
                {change}% vs same days of {previousMonth}
              </>
            )}
          </span>
        </div>
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
