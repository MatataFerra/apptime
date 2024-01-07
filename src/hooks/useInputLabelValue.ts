import { useEffect, useState } from "react";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function useInputLabelValue() {
  const { inputsDisabled, initialShiftState, clickOnSave } = useShiftStateContext((state) => state);
  const [inputValue, setInputValue] = useState(initialShiftState);

  useEffect(() => {
    if (clickOnSave) return;

    if (inputsDisabled) {
      const { from, to, start, end } = initialShiftState;
      setInputValue((prev) => ({
        ...prev,
        from,
        to,
        start,
        end,
      }));
    }
  }, [initialShiftState, inputsDisabled, clickOnSave]);

  return { inputValue, setInputValue };
}

export default useInputLabelValue;
