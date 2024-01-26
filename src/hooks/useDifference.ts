import { useEffect, useState } from "react";

import { isNaN } from "lodash";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import useInputValuesStore from "@/store/useInputValuesStore";

function useDifference() {
  const inputValues = useInputValuesStore((state) => state.inputValues);
  const [difference, setDifference] = useState<string>("");

  useEffect(() => {
    const formatStart = new DateHumanizer("formatAndAddTime").humanizeDate(
      new Date(inputValues.from ?? ""),
      { time: inputValues.start ?? "" }
    );

    const formatEnd = new DateHumanizer("formatAndAddTime").humanizeDate(
      new Date(inputValues.to ?? ""),
      { time: inputValues.end ?? "" }
    );

    const { text, diff } = ShiftService.differenceInHHmm(formatStart, formatEnd);

    if (isNaN(diff)) return;

    setDifference(text);
  }, [inputValues]);

  return { getDifference: difference };
}

export default useDifference;
