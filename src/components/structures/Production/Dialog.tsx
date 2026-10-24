"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useTranslations } from "next-intl";

import { withContributions } from "@/services/Contribution/math";
import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import useMoney from "@/hooks/useMoney";
import useShortDateTime from "@/hooks/useShortDateTime";

import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function DialogProduction({ children }: PropsWithChildren) {
  const format$ = useMoney();
  const humanize = useShortDateTime();
  const t = useTranslations("shift");
  const { values, dialog, setDialogState, formError } = useProductionForm((state) => state);
  const currency = values.currency;
  // In the shift's own currency.
  function money(value: number) {
    return format$(value, { currency });
  }
  const {
    taxesModule: { salaryElement: taxes },
    contributionsModule: { salaryElement: contributions },
  } = useProductionTaxesOrContributionsStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [formError, setDialogState, dialog]);

  const base = new ShiftService({
    itemValue: Number(values.itemValue ?? 0),
    itemQuantity: Number(values.itemQuantity),
    isPublicHoliday: !!values.isPublicHoliday,
    publicHolidayWorked: !!values.publicHolidayWorked,
  })
    .checkPublicHoliday()
    .calculateEarnings();
  // Holiday pay and the like go on top of the pieces.
  const gross = withContributions(base, contributions);
  const afterTaxes = Pay.afterTax(gross, taxes);
  const earnings = {
    gross: isNaN(gross) ? 0 : gross,
    afterTaxes: isNaN(afterTaxes) ? 0 : afterTaxes,
  };

  const tags = [
    values.isPublicHoliday ? t("tags.public_holiday") : null,
    values.isPublicHoliday && values.publicHolidayWorked ? t("tags.worked_holiday") : null,
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
        ...(values.name ? [{ label: t("fields.job"), value: values.name }] : []),
        { label: t("fields.start"), value: humanize(values.startDate) },
        { label: t("fields.finish"), value: humanize(values.finishDate) },
        {
          label: t("fields.pieces"),
          value: `${values.itemQuantity ?? 0} × ${money(Number(values.itemValue ?? 0))}`,
        },
      ]}
    >
      {children}
    </ShiftReviewDialog>
  );
}

export default DialogProduction;
