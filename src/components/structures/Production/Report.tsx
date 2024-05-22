import { useMemo } from "react";

import dynamic from "next/dynamic";

import ShiftService from "@/services/Shift";
import ProductionService from "@/services/Shift/Production";

import Skeleton from "@/components/ui/Skeleton";

import useHumanizeDate from "@/hooks/useHumanizeDate";

import { useProductionForm } from "@/store/useProductionForm";

const FormReport = dynamic(() => import("@/components/structures/share/FormReport"), {
  ssr: false,
  loading: () => <Skeleton classes="h-28 w-1/2" />,
});

function Report() {
  const {
    values: { startDate, finishDate, itemValue, itemQuantity, holidayPayRate, publicHolidayWorked },
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
    const earnings = ProductionService.earnings({
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

export default Report;
