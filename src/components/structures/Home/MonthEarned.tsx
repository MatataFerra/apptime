"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { compareWithPreviousMonth } from "@/services/Summary";

import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";

/** "$3,410 this month", for the dashboard shortcut. */
function MonthEarned() {
  const { hourly, production, currency } = useShiftsInCurrency();
  const money = useMoney(currency);
  const t = useTranslations("home");
  const earned = useMemo(
    () => compareWithPreviousMonth(hourly, production).current.earned,
    [hourly, production]
  );

  if (!earned) return null;

  return <>{t("month_earned", { amount: money(earned, { cents: false }) })}</>;
}

export default MonthEarned;
