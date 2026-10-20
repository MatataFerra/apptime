"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import { differenceInMinutes, format } from "date-fns";

import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useMoney from "@/hooks/useMoney";

import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function humanize(date?: string | Date | null) {
  if (!date) return "–";
  const d = new Date(date);
  return isNaN(d.valueOf()) ? "–" : format(d, "MMM d, h:mm a");
}

function DialogHourly({ children }: PropsWithChildren) {
  const money = useMoney();
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
    const time = ShiftService.convertDifferenceInHHmm(getDifference);

    return time.text;
  }, [formatEnd, formatStart]);

  const calculateEarn = useMemo(() => {
    const prepareShift = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastHoliday,
      publicHolidayWorked: fastWorked,
      hourValue: Number(hourValue),
      unpaidBreaks: Number(unpaidBreaks),
    };

    const earnings = new ShiftService(prepareShift).checkPublicHoliday().calculateEarnings();
    const getTaxesDiscount = Pay.afterTax(earnings, taxes);

    return {
      sharp: isNaN(earnings) ? 0 : earnings,
      afterTaxes: isNaN(getTaxesDiscount) ? 0 : getTaxesDiscount,
    };
  }, [fastHoliday, fastWorked, formatEnd, formatStart, hourValue, taxes, unpaidBreaks]);

  const tags = [
    fastHoliday ? "Public holiday" : null,
    fastHoliday && fastWorked ? "Worked the holiday" : null,
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
        { label: "Start", value: humanize(formatStart) },
        { label: "Finish", value: humanize(formatEnd) },
        { label: "Time worked", value: totalTimeWorked },
        { label: "Hourly rate", value: money(Number(hourValue) || 0, { currency }) },
        ...(unpaidBreaks ? [{ label: "Unpaid breaks", value: `${unpaidBreaks} min` }] : []),
      ]}
    >
      {children}
    </ShiftReviewDialog>
  );
}

export default DialogHourly;
