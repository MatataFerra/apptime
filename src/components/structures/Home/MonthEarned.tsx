"use client";

import { useMemo } from "react";

import { compareWithPreviousMonth, formatMoney } from "@/services/Summary";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

/** "$3,410 this month", for the dashboard shortcut. */
function MonthEarned() {
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();
  const earned = useMemo(
    () => compareWithPreviousMonth(hourly, production).current.earned,
    [hourly, production]
  );

  if (!earned) return null;

  return <>{formatMoney(earned, { cents: false })} this month</>;
}

export default MonthEarned;
