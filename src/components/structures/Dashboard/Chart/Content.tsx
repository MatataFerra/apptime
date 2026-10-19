"use client";

import { cumulativeEarnings, historyEntries, weeklyEarnings } from "@/services/History";
import { weekStartsOnIndex } from "@/services/Summary";

import SeasonChart from "@/components/structures/Dashboard/Charts/SeasonChart";
import WeeklyChart from "@/components/structures/Dashboard/Charts/WeeklyChart";
import Skeleton from "@/components/ui/Skeleton";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";
import useUser from "@/hooks/useUser";

function Content() {
  const { data: user } = useUser();
  const { data: hourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: production, isLoading: loadingProduction } = useProductionShifts();

  if (loadingHourly || loadingProduction) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton classes="h-80 w-full rounded-[20px]" />
        <Skeleton classes="h-80 w-full rounded-[20px]" />
      </div>
    );
  }

  const entries = historyEntries(hourly, production);

  if (!entries.length) {
    return (
      <p className="rounded-[20px] border border-dashed border-border-strong p-6 text-center text-sm text-ink-muted">
        Your charts show up after your first saved shift.
      </p>
    );
  }

  const weekStartsOn = weekStartsOnIndex(user?.config?.weekStartsOn);

  return (
    <div className="flex flex-col gap-4">
      <WeeklyChart data={weeklyEarnings(entries, { weekStartsOn })} />
      <SeasonChart data={cumulativeEarnings(entries)} />
    </div>
  );
}

export default Content;
