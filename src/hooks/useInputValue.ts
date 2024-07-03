import { useEffect } from "react";

import useTrack from "@/hooks/useTrack";

import useInputValuesStore from "@/store/useInputValuesStore";

function useInputValue() {
  const { inputsDisabled, initialShiftState, clickOnSave } = useTrack();
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
