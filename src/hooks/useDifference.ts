import { MutableRefObject, RefObject, useCallback } from "react";

import ShiftService from "@/services/Shift";

function getFullDate({ date, time }: { date: Date | undefined | null; time: string }) {
  const dateFomated = formatDate(date ?? new Date());

  return addHoursAndMinutes(new Date(dateFomated), time);
}

function formatDate(date = new Date()) {
  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", {
    month: "2-digit",
  });
  const day = date.toLocaleString("default", { day: "2-digit" });

  return [year, month, day].join("-");
}

function addHoursAndMinutes(date: Date, time: string) {
  const [hours, minutes] = time.split(":");

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  return date;
}

function useDifference(inputRefs: MutableRefObject<RefObject<HTMLInputElement>[]>) {
  function getDifference() {
    const { current } = inputRefs;
    const from = current.find((ref) => ref.current?.dataset.label === "from")?.current?.valueAsDate;
    const to = current.find((ref) => ref.current?.dataset.label === "to")?.current?.valueAsDate;
    const start = current.find((ref) => ref.current?.dataset.label === "start")?.current?.value;
    const end = current.find((ref) => ref.current?.dataset.label === "end")?.current?.value;

    if (!from || !to || !start || !end) return "";

    const text = ShiftService.differenceInHHmm(
      getFullDate({
        date: from,
        time: start ?? "",
      }),
      getFullDate({
        date: to,
        time: end ?? "",
      })
    ).text;

    return text;
  }

  const getDifferenceCallback = useCallback(getDifference, [inputRefs]);

  return { getDifference: getDifferenceCallback };
}

export default useDifference;
