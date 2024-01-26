import { create } from "zustand";

type InputValueStore = {
  inputValues: {
    [keys in "from" | "to" | "start" | "end"]: string | undefined;
  };
  setInputValues: (value: Partial<InputValueStore["inputValues"]>) => void;
};

const useInputValuesStore = create<InputValueStore>((set) => ({
  inputValues: {
    from: "",
    to: "",
    start: "",
    end: "",
  },

  setInputValues: (value) => {
    set((state) => {
      return {
        inputValues: {
          ...state.inputValues,
          ...value,
        },
      };
    });
  },
}));

export default useInputValuesStore;
