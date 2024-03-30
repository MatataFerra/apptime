import { useEffect } from "react";

import { LABELS } from "@/components/ShiftDialog/finish_description";

import useDifference from "./useDifference";
import useInputValue from "./useInputValue";
import useTimeAccordLabel from "./useTimeAccordLabel";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

export type Labels = (typeof LABELS)[number];

function useTimeLabel() {
  const {
    shiftUnclosed: { shift },
    differenceBetweenStartAndEnd,
    updateDifferenceBetweenStartAndEnd,
    initialShiftState,
    setInitialShiftState,
  } = useShiftStateContext((state) => state);

  const getTimeAcoordingLabel = useTimeAccordLabel(shift);

  const { getDifference } = useDifference();
  const { inputValue, setInputValue } = useInputValue();

  useEffect(() => {
    updateDifferenceBetweenStartAndEnd(getDifference);
  }, [getDifference, updateDifferenceBetweenStartAndEnd]);

  useEffect(() => {
    setInitialShiftState({
      diff: getDifference,
      from: getTimeAcoordingLabel("from"),
      to: getTimeAcoordingLabel("to"),
      start: getTimeAcoordingLabel("start"),
      end: getTimeAcoordingLabel("end"),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDifference]);

  return {
    getTimeAcoordingLabel,
    diff: differenceBetweenStartAndEnd,
    setDiff: updateDifferenceBetweenStartAndEnd,
    initialState: initialShiftState,
    getDifference,
    inputValue,
    setInputValue,
  };
}

export default useTimeLabel;
