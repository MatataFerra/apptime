"use client";

import ChartService from "@/services/Chart";

import type { UserType } from "@/types";

import BarChart from "@/components/ui/Chart/BarChart";

type Props = {
  user: UserType | null | undefined;
};

function EarnsPerDay({ user }: Props) {
  const earnsPerDay = new ChartService(user?.shifts).earnsPerDay();

  return <BarChart data={earnsPerDay} />;
}

export default EarnsPerDay;
