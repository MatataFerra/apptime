import { MutableRefObject, useEffect, useState } from "react";

import useLabel from "./useLabel";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type Ref = MutableRefObject<{ diff: string; from: string; to: string; start: string; end: string }>;

function useInputLabelValue(initialState: Ref) {
  const {
    shiftUnclosed: { shift },
    inputsDisabled,
  } = useShiftStateContext((state) => state);
  const getTimeAcoordingLabel = useLabel(shift);
  const [inputValue, setInputValue] = useState({
    from: getTimeAcoordingLabel("from"),
    to: getTimeAcoordingLabel("to"),
    start: getTimeAcoordingLabel("start"),
    end: getTimeAcoordingLabel("end"),
  });

  useEffect(() => {
    if (inputsDisabled) {
      const { from, to, start, end } = initialState.current;
      setInputValue({ from, to, start, end });
    }
  }, [initialState, inputsDisabled]);

  return { inputValue, setInputValue };
}

export default useInputLabelValue;
