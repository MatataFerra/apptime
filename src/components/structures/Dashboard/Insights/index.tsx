"use client";

import { weekStartsOnIndex } from "@/services/Summary";
import { earningsSplit, monthlyEarnings, weeklyEarnings } from "@/services/Summary/history";

import Skeleton from "@/components/ui/Skeleton";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";
import useUser from "@/hooks/useUser";

import MonthlyTrend from "./MonthlyTrend";
import Split from "./Split";
import WeeklyChart from "./WeeklyChart";

/** Dashboard charts: where the pay comes from, week by week, month by month. */
function Insights() {
  const { data: user } = useUser();
  const { data: hourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: production, isLoading: loadingProduction } = useProductionShifts();

  if (loadingHourly || loadingProduction) {
    return <Skeleton classes="h-72 w-full rounded-[20px]" />;
  }

  const split = earningsSplit(hourly, production);
  if (!split.total) {
    return (
      <p className="rounded-[20px] border border-dashed border-border-strong px-4 py-10 text-center text-sm text-ink-muted">
        Charts show up after your first saved shift.
      </p>
    );
  }

  const weekStartsOn = weekStartsOnIndex(user?.config?.weekStartsOn);

  return (
    <div className="flex flex-col gap-3">
      <Split {...split} />
      <WeeklyChart data={weeklyEarnings(hourly, production, { weekStartsOn })} />
      <MonthlyTrend data={monthlyEarnings(hourly, production)} />
    </div>
  );
}

export default Insights;
