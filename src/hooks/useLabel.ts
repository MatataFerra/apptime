import { useMemo } from "react";

import { Shift } from "@prisma/client";

import { Labels } from "./useTimeLabel";

function formatDate(date = new Date()) {
  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", {
    month: "2-digit",
  });
  const day = date.toLocaleString("default", { day: "2-digit" });

  return [year, month, day].join("-");
}

function getFormattedDate(date: Date) {
  return formatDate(date);
}
function getFormattedTime(date: Date) {
  return date.toLocaleTimeString();
}

function useLabel(shift: Shift | null) {
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

export default useLabel;
