"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import type { HourlyType, ProductionType } from "@/types";

import { findClash } from "@/utils/helpers/batchShifts";
import useDateLocale from "@/hooks/useDateLocale";

/**
 * Before saving one shift: two jobs the same day are fine (Box Maker in
 * the morning, Web Developer at night), the same hours twice are not.
 * `isFree` says so and, when it isn't, names the shift in the way. The
 * server checks again.
 */
function useOverlapGuard(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null
) {
  const t = useTranslations("shift");
  const locale = useDateLocale();

  return function isFree(span: { startDate: string; endDate: string }) {
    const clash = findClash(span, [...(hourly ?? []), ...(production ?? [])]);
    if (!clash) return true;

    function time(date: string | Date) {
      return format(new Date(date), "EEE d, p", { locale });
    }
    Toast({
      type: "error",
      message: t("overlap"),
      description: t("overlap_description", {
        name: clash.name || t("your_shift"),
        start: time(clash.startDate),
        end: clash.endDate ? format(new Date(clash.endDate), "p", { locale }) : "…",
      }),
      duration: 6000,
    });
    return false;
  };
}

export default useOverlapGuard;
