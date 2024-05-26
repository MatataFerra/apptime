import { create } from "zustand";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";

type Values = typeof SETTINGS_FIELDS;

interface Settings {
  currentInput: string;
  isDirty: boolean;
  values: Values;
  defaultValues: Values;
  setDefaultValues: (newValues: Partial<Values>) => void;
  setIsDirty: (fn: (prev: Values) => boolean) => void;
  setValue: (newValue: Partial<Values>) => void;
  setCurrentInput: (newInput: string) => void;
}

export const useSettingsStore = create<Settings>((set, get) => ({
  currentInput: "",
  isDirty: false,
  values: {
    account: { email: "", name: "" },
    personal: { city: "", country: "" },
    configs: { weekStartsOn: "" },
  },
  defaultValues: {
    account: { email: "", name: "" },
    personal: { city: "", country: "" },
    configs: { weekStartsOn: "" },
  },
  setIsDirty: (fn: (prev: Values) => boolean) => {
    return set((state) => {
      return {
        ...state,
        isDirty: fn(state.values),
      };
    });
  },
  setCurrentInput: (newInput) => set({ currentInput: newInput }),
  setValue: (newValue) => {
    return set({
      values: {
        ...get().values,
        ...newValue,
      },
    });
  },
  setDefaultValues: (newValue) => {
    return set({
      defaultValues: {
        ...get().values,
        ...newValue,
      },
    });
  },
}));
