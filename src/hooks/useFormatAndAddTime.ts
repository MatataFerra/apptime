import { useMemo } from "react";

import DateHumanizer from "@/services/Date";

function useFormatAndAddTime({ date, time }: { date: string; time: string | undefined }) {
  const result = useMemo(() => {
    const formatDate = new DateHumanizer("formatAndAddTime").humanizeDate(new Date(date ?? ""), {
      time: time ?? "",
    });

    return formatDate;
  }, [date, time]);

  return result;
}

export default useFormatAndAddTime;
