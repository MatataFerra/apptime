"use client";

import { useMemo } from "react";

import ShiftService from "@/services/Shift";

import FormReport from "@/components/FormReport";

import useHumanizeDate from "@/hooks/useHumanizeDate";

import { useProductionForm } from "@/store/useProductionForm";

function ProductionFormReport() {
  const {
    values: {
      startDate,
      finishDate,
      itemValue,
      itemQuantity,
      holidayPayRate,
      isPublicHoliday,
      publicHolidayWorked,
    },
  } = useProductionForm((state) => state);

  const humanizeStartDate = useHumanizeDate({ date: startDate ?? "" });
  const shift = useMemo(() => {
    if (startDate && finishDate) {
      const start = new Date(startDate);
      const end = new Date(finishDate);

      const shift = ShiftService.differenceInHHmm(start, end);

      return shift;
    }

    return null;
  }, [startDate, finishDate]);

  const calculateProductionEarn = useMemo(() => {
    const earnings = ShiftService.calculateProductionEarnings({
      itemValue: Number(itemValue ?? 0),
      itemQuantity: Number(itemQuantity),
      holidayPayRate: Number(holidayPayRate),
      publicHolidayWorked: !!publicHolidayWorked,
    });

    return isNaN(earnings) ? 0 : earnings;
  }, [holidayPayRate, publicHolidayWorked, itemQuantity, itemValue]);

  return (
    <FormReport
      startDate={humanizeStartDate}
      workedTime={shift?.text}
      earnings={calculateProductionEarn}
    />
  );
}

export default ProductionFormReport;
