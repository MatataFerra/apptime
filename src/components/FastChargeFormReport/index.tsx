import { useMemo } from "react";

import ShiftService from "@/services/Shift";

import FormReport from "@/components/FormReport";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useHumanizeDate from "@/hooks/useHumanizeDate";

import { useFastChargeStore } from "@/store/useFastChargeStore";

function FastChargeFormReport() {
  const {
    values: {
      startDate,
      finishDate,
      startTime,
      finishTime,
      fastWorked,
      holidayPayRate,
      hourValue,
      unpaidBreaks,
    },
  } = useFastChargeStore((state) => state);
  const humanizeStartDate = useHumanizeDate({ date: startDate ?? "" });

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  const shift = useMemo(() => {
    if (startDate && finishDate && startTime && finishTime) {
      const start = new Date(formatStart);
      const end = new Date(formatEnd);

      const shift = ShiftService.differenceInHHmm(start, end);

      return shift;
    }

    return null;
  }, [finishDate, finishTime, formatEnd, formatStart, startDate, startTime]);

  const calculateEarnings = useMemo(() => {
    const earnings = ShiftService.calculateEarnings({
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastWorked,
      hourValue: Number(hourValue),
      holidayPayRate: Number(holidayPayRate),
      unpaidBreaks: Number(unpaidBreaks),
    });

    return isNaN(earnings) ? 0 : earnings;
  }, [formatStart, formatEnd, fastWorked, hourValue, holidayPayRate, unpaidBreaks]);

  return (
    <FormReport
      startDate={humanizeStartDate}
      workedTime={shift?.text}
      earnings={calculateEarnings}
    />
  );
}

export default FastChargeFormReport;
