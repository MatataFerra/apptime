"use client";

import { useMemo } from "react";

import { compareWithPreviousMonth } from "@/services/Summary";

import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";

/** "$3,410 this month", for the dashboard shortcut. */
function MonthEarned() {
  const money = useMoney();
  const { hourly, production } = useShiftsInCurrency();
  const earned = useMemo(
    () => compareWithPreviousMonth(hourly, production).current.earned,
    [hourly, production]
  );

  if (!earned) return null;

  return <>{money(earned, { cents: false })} this month</>;
}

export default MonthEarned;
