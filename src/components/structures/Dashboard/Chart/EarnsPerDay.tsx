"use client";

import ChartService from "@/services/Chart";

import BarChart from "@/components/ui/Chart/BarChart";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

function EarnsPerDay() {
  const { data: hourlies } = useHourlyShifts();
  const { data: productions } = useProductionShifts();

  const earnsPerDay = new ChartService(hourlies, productions, "hourly").earnsPerDay();

  return <BarChart data={earnsPerDay} />;
}

export default EarnsPerDay;
