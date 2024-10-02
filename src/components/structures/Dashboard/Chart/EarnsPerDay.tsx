"use client";

import ChartService from "@/services/Chart";

import BarChart from "@/components/ui/Chart/BarChart";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

// Override console.error
// This is a hack to suppress the warning about missing defaultProps in recharts library as of version 2.12
// @link https://github.com/recharts/recharts/issues/3615
// eslint-disable-next-line no-console
const error = console.error;
// eslint-disable-next-line no-console
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

const AMOUNT_DAYS = -30;

function EarnsPerDay() {
  const { data: hourlies } = useHourlyShifts();
  const { data: productions } = useProductionShifts();

  // const lastShift = data ? new Dashboard(hourlies, productions).lastDayRegistered : Date.now();

  const earnsPerDay = new ChartService(hourlies, productions, "hourly").earnsPerDay();

  return <BarChart data={earnsPerDay} />;
}

export default EarnsPerDay;
