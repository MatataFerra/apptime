"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import { format } from "date-fns";

import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";
import { formatMoney } from "@/services/Summary";

import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function humanize(date?: string | null) {
  if (!date) return "–";
  const d = new Date(date);
  return isNaN(d.valueOf()) ? "–" : format(d, "MMM d, h:mm a");
}

function DialogProduction({ children }: PropsWithChildren) {
  const { values, dialog, setDialogState, formError } = useProductionForm((state) => state);
  const {
    taxesModule: { salaryElement: taxes },
  } = useProductionTaxesOrContributionsStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [formError, setDialogState, dialog]);

  const earnings = useMemo(() => {
    const prepareShift = {
      itemValue: Number(values.itemValue ?? 0),
      itemQuantity: Number(values.itemQuantity),
    };
    const gross = new ShiftService(prepareShift).checkPublicHoliday().calculateEarnings();
    const afterTaxes = Pay.afterTax(gross, taxes);

    return {
      gross: isNaN(gross) ? 0 : gross,
      afterTaxes: isNaN(afterTaxes) ? 0 : afterTaxes,
    };
  }, [taxes, values.itemQuantity, values.itemValue]);

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
          value: `${values.itemQuantity ?? 0} × ${formatMoney(Number(values.itemValue ?? 0))}`,
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
