import { create } from "zustand";

export type RadioInputsState = {
  night: boolean;
  pay: boolean;
  breaks: boolean;
};

interface RadioInputState {
  value: string;
  radioInputValue: RadioInputsState[];
  __INPUT_VALUE_MATCHER: {
    true: string;
    false: string;
  };
  setValue: (value: string) => void;
  setRadioInputValue: (value: RadioInputsState[]) => void;
  isInputActive: (id: string | undefined) => RadioInputsState | boolean;
}

export const useRadioInput = create<RadioInputState>((set, get) => ({
  value: "",
  radioInputValue: [],
  __INPUT_VALUE_MATCHER: {
    true: "1",
    false: "0",
  },
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
}));
