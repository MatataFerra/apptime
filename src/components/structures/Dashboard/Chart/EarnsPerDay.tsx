"use client";

import { addDays } from "date-fns";
import cloneDeep from "lodash/cloneDeep";

import ChartService from "@/services/Chart";
import Dashboard from "@/services/Dashboard";

import type { UserType } from "@/types";

import BarChart from "@/components/ui/Chart/BarChart";

type Props = {
  user: UserType | null | undefined;
};

const AMOUNT_DAYS = -20;

function EarnsPerDay({ user }: Props) {
  const lastShift = user ? new Dashboard(user).lastDayRegistered : Date.now();

  const earnsPerDay = new ChartService(cloneDeep(user?.shifts))
    .period(addDays(new Date(Date.now()), AMOUNT_DAYS), new Date(lastShift))
    .earnsPerDay();

  return <BarChart data={earnsPerDay} />;
}

export default EarnsPerDay;
