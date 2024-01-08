import { MutableRefObject, RefObject, useCallback, useEffect, useState } from "react";

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
  const [values, setValues] = useState<{
    from: RefObject<HTMLInputElement> | undefined;
    to: RefObject<HTMLInputElement> | undefined;
    start: RefObject<HTMLInputElement> | undefined;
    end: RefObject<HTMLInputElement> | undefined;
  }>({
    from: undefined,
    to: undefined,
    start: undefined,
    end: undefined,
  });
  function getDifference() {
    const { current } = inputRefs;
    const from = current.find((ref) => ref.current?.dataset.label === "from");
    const to = current.find((ref) => ref.current?.dataset.label === "to");
    const start = current.find((ref) => ref.current?.dataset.label === "start");
    const end = current.find((ref) => ref.current?.dataset.label === "end");

    setValues({
      from,
      to,
      start,
      end,
    });

    if (!from || !to || !start || !end) return "";

    const text = ShiftService.differenceInHHmm(
      getFullDate({
        date: values?.from?.current?.valueAsDate,
        time: values?.start?.current?.value ?? "",
      }),
      getFullDate({
        date: values?.to?.current?.valueAsDate,
        time: values?.end?.current?.value ?? "",
      })
    ).text;

    return text;
  }

  const getDifferenceCallback = useCallback(getDifference, [
    inputRefs,
    values.end,
    values?.from,
    values?.start,
    values.to,
  ]);

  return { getDifference: getDifferenceCallback };
}

export default useDifference;
