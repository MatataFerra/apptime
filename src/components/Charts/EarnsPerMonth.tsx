"use client";

import ChartService from "@/services/Chart";

import { UserType } from "@/types";

import Chart from "../ui/Chart";

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
  user: UserType | null;
};

function EarnsPerMonth({ user }: Props) {
  const earnsPerMonth = new ChartService(user?.shifts ?? [])
    .earnsPerMonth(user?.profile!)
    .filter((data) => data !== null);

  const sortEarns = ChartService.sortEarnsPerMonth(earnsPerMonth);

  return (
    <Chart
      data={sortEarns}
      legend="Shift payment per Month"
      color={{ from: "from-blue-400", to: "to-orange-200" }}
    />
  );
}

export default EarnsPerMonth;
