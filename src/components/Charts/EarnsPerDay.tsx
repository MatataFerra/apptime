"use client";

import ChartService from "@/services/Chart";

import { UserType } from "@/types";

import Chart from "@/components/ui/Chart";

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

function EarnsPerDay({ user }: Props) {
  const earnsPerDay = new ChartService(user?.shifts ?? []).earnsPerDay(user?.profile!);

  return <Chart data={earnsPerDay} legend="Shift payment per Day" color={"bg-green-500"} />;
}

export default EarnsPerDay;
