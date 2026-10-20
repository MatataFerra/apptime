"use client";

import { type PropsWithChildren, useEffect } from "react";

import { format } from "date-fns";

import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import useMoney from "@/hooks/useMoney";

import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function humanize(date?: string | null) {
  if (!date) return "–";
  const d = new Date(date);
  return isNaN(d.valueOf()) ? "–" : format(d, "MMM d, h:mm a");
}

function DialogProduction({ children }: PropsWithChildren) {
  const format$ = useMoney();
  const { values, dialog, setDialogState, formError } = useProductionForm((state) => state);
  const currency = values.currency;
  // In the shift's own currency.
  function money(value: number) {
    return format$(value, { currency });
  }
  const {
    taxesModule: { salaryElement: taxes },
  } = useProductionTaxesOrContributionsStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [formError, setDialogState, dialog]);

  const gross = new ShiftService({
    itemValue: Number(values.itemValue ?? 0),
    itemQuantity: Number(values.itemQuantity),
    isPublicHoliday: !!values.isPublicHoliday,
    publicHolidayWorked: !!values.publicHolidayWorked,
  })
    .checkPublicHoliday()
    .calculateEarnings();
  const afterTaxes = Pay.afterTax(gross, taxes);
  const earnings = {
    gross: isNaN(gross) ? 0 : gross,
    afterTaxes: isNaN(afterTaxes) ? 0 : afterTaxes,
  };

  const tags = [
    values.isPublicHoliday ? "Public holiday" : null,
    values.isPublicHoliday && values.publicHolidayWorked ? "Worked the holiday" : null,
  ].filter(Boolean) as string[];

  return (
    <ShiftReviewDialog
      open={dialog}
      onOpenChange={setDialogState}
      formId="production-job"
      theme="production"
      currency={currency}
      gross={earnings.gross}
      afterTaxes={earnings.afterTaxes}
      taxes={taxes}
      tags={tags}
      rows={[
        ...(values.name ? [{ label: "Job", value: values.name }] : []),
        { label: "Start", value: humanize(values.startDate) },
        { label: "Finish", value: humanize(values.finishDate) },
        {
          label: "Pieces",
          value: `${values.itemQuantity ?? 0} × ${money(Number(values.itemValue ?? 0))}`,
        },
        ...(values.holidayPayRate
          ? [{ label: "Holiday pay", value: `${values.holidayPayRate}%` }]
          : []),
      ]}
    >
      {children}
    </ShiftReviewDialog>
  );
}

export default DialogProduction;
