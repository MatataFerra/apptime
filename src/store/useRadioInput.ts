import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type RadioInputsState = {
  extraNightShiftPay: boolean;
  holidayPayRate: boolean;
  unpaidBreaks: boolean;
};

interface RadioInputState {
  value: string;
  radioInputValue: RadioInputsState[];
  setValue: (value: string) => void;
  setRadioInputValue: (value: RadioInputsState[]) => void;
  isInputActive: (id: string | undefined) => RadioInputsState | boolean;
}

export const useRadioInput = create(
  devtools<RadioInputState>(
    (set, get) => ({
      value: "",
      radioInputValue: [],
      setValue: (value) => set({ value }),
      setRadioInputValue: (radioInputValue) => set({ radioInputValue }),
      isInputActive: (id) => {
        const { radioInputValue } = get();

        if (typeof id === "undefined") return false;

        // transform object to array
        const radioInputValueArray = Object.entries(radioInputValue)
          .map(([key, value]) => ({
            [key]: value,
          }))
          .find((item: any) => item[id]);

        if (typeof radioInputValueArray === "undefined") return false;

        return radioInputValueArray[id];
      },
    }),
    {
      name: "useRadioInput",
    }
  )
);
