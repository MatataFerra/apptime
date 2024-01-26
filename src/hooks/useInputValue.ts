import { useEffect } from "react";

import useInputValuesStore from "@/store/useInputValuesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function useInputValue() {
  const { inputsDisabled, initialShiftState, clickOnSave } = useShiftStateContext((state) => state);
  const { setInputValues, inputValues } = useInputValuesStore((state) => state);

  useEffect(() => {
    if (clickOnSave) return;

    if (inputsDisabled) {
      const { from, to, start, end } = initialShiftState;
      setInputValues({
        from,
        to,
        start,
        end,
      });
    }
  }, [initialShiftState, inputsDisabled, clickOnSave, setInputValues]);

  return { inputValue: inputValues, setInputValue: setInputValues };
}

export default useInputValue;
