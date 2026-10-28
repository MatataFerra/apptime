"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import { differenceInMinutes } from "date-fns";
import { useTranslations } from "next-intl";

import { withContributions } from "@/services/Contribution/math";
import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useMoney from "@/hooks/useMoney";
import useShortDateTime from "@/hooks/useShortDateTime";
import useUser from "@/hooks/useUser";

import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function DialogHourly({ children }: PropsWithChildren) {
  const money = useMoney();
  const humanize = useShortDateTime();
  const t = useTranslations("shift");
  const holidayRate = useUser().data?.config?.holidayRate;
  const {
    values: {
      startDate,
      startTime,
      finishDate,
      finishTime,
      fastWorked,
      hourValue,
      unpaidBreaks,
      fastHoliday,
      currency,
    },
    dialog,
    setDialogState,
    formError,
  } = useFastChargeStore((state) => state);

  const {
    taxesModule: { salaryElement: taxes },
    contributionsModule: { salaryElement: contributions },
  } = useHourlyTaxesOrContributionsStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [dialog, formError, setDialogState]);

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  const totalTimeWorked = useMemo(() => {
    const getDifference = differenceInMinutes(formatEnd, formatStart);
    // "8h 30m" reads the same in every language.
    return ShiftService.convertDifferenceInHHmm(getDifference).text;
  }, [formatEnd, formatStart]);

  const calculateEarn = useMemo(() => {
    const prepareShift = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastHoliday,
      publicHolidayWorked: fastWorked,
      hourValue: Number(hourValue),
      unpaidBreaks: Number(unpaidBreaks),
      // Saved with the multiplier from Settings.
      holidayRate: holidayRate ?? null,
    };

    // Holiday pay and the like go on top of the hours.
    const earnings = withContributions(
      new ShiftService(prepareShift).checkPublicHoliday().calculateEarnings(),
      contributions
    );
    const getTaxesDiscount = Pay.afterTax(earnings, taxes);

    return {
      sharp: isNaN(earnings) ? 0 : earnings,
      afterTaxes: isNaN(getTaxesDiscount) ? 0 : getTaxesDiscount,
    };
  }, [
    contributions,
    fastHoliday,
    fastWorked,
    formatEnd,
    formatStart,
    holidayRate,
    hourValue,
    taxes,
    unpaidBreaks,
  ]);

  const tags = [
    fastHoliday ? t("tags.public_holiday") : null,
    fastHoliday && fastWorked ? t("tags.worked_holiday") : null,
  ].filter(Boolean) as string[];

  return (
    <ShiftReviewDialog
      open={dialog}
      onOpenChange={setDialogState}
      formId="fast-charge"
      theme="fast"
      gross={calculateEarn.sharp}
      currency={currency}
      afterTaxes={calculateEarn.afterTaxes}
      taxes={taxes}
      tags={tags}
      rows={[
        { label: t("fields.start"), value: humanize(formatStart) },
        { label: t("fields.finish"), value: humanize(formatEnd) },
        { label: t("fields.time_worked"), value: totalTimeWorked },
        { label: t("fields.hourly_rate"), value: money(Number(hourValue) || 0, { currency }) },
        ...(unpaidBreaks
          ? [
              {
                label: t("fields.unpaid_breaks"),
                value: t("minutes", { count: Number(unpaidBreaks) }),
              },
            ]
          : []),
      ]}
    >
      {children}
    </ShiftReviewDialog>
  );
}

export default DialogHourly;
