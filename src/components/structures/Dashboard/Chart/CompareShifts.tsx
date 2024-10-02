"use client";

import ChartService from "@/services/Chart";

import AreaChartComponent from "@/components/ui/Chart/AreaChart";

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

function CompareShifts() {
  const { data: hourlies } = useHourlyShifts();
  const { data: productions } = useProductionShifts();
  const earnsPerType = new ChartService(hourlies, productions).earnsPerType();

  return <AreaChartComponent data={earnsPerType} />;
}

export default CompareShifts;
