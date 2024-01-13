import { MutableRefObject, RefObject, useEffect } from "react";

import { LABELS } from "@/components/ShiftDialog/finish_description";

import useDifference from "./useDifference";
import useInputLabelValue from "./useInputLabelValue";
import useLabel from "./useLabel";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

export type Labels = (typeof LABELS)[number];

function useTimeLabel(inputRefs: MutableRefObject<RefObject<HTMLInputElement>[]>) {
  const {
    shiftUnclosed: { shift },
    differenceBetweenStartAndEnd,
    updateDifferenceBetweenStartAndEnd,
    initialShiftState,
    setInitialShiftState,
  } = useShiftStateContext((state) => state);

  const getTimeAcoordingLabel = useLabel(shift);
  const { getDifference } = useDifference(inputRefs);

  const { inputValue, setInputValue } = useInputLabelValue();

  useEffect(() => {
    const t = getDifference();

    updateDifferenceBetweenStartAndEnd(t);
  }, [getDifference, updateDifferenceBetweenStartAndEnd]);

  useEffect(() => {
    const t = getDifference();
    setInitialShiftState({
      diff: t,
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
