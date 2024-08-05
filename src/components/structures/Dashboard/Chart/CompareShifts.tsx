"use client";

import ChartService from "@/services/Chart";

import type { UserType } from "@/types";

import AreaChartComponent from "@/components/ui/Chart/AreaChart";
import Line from "@/components/ui/Chart/Line";

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

type Props = {
  user: UserType | null | undefined;
};

function CompareShifts({ user }: Props) {
  const earnsPerType = new ChartService(user?.shifts).earnsPerType();

  return <AreaChartComponent data={earnsPerType} />;
}

export default CompareShifts;
