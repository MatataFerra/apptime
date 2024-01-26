import { useMemo } from "react";

import { Shift } from "@prisma/client";

import DateHumanizer from "@/services/Date";

import { Labels } from "./useTimeLabel";

function getFormattedDate(date: Date) {
  return new DateHumanizer("formatDate").humanizeDate(date);
}
function getFormattedTime(date: Date) {
  return date.toLocaleTimeString();
}

function useTimeAccordLabel(shift: Shift | null) {
  const getTimeAcoordingLabel = useMemo(() => {
    const labelToFunctionMap = {
      from: () => getFormattedDate(new Date(shift?.startDate ?? Date.now())),
      to: () => getFormattedDate(new Date(shift?.endDate ?? Date.now())),
      start: () => getFormattedTime(new Date(shift?.startDate ?? Date.now())),
      end: () => getFormattedTime(new Date(shift?.endDate ?? Date.now())),
    };

    return (label: Labels) => labelToFunctionMap[label]?.() ?? "";
  }, [shift?.endDate, shift?.startDate]);

  return getTimeAcoordingLabel;
}

export default useTimeAccordLabel;
