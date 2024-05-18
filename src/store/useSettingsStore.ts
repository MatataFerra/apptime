import { create } from "zustand";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";

type Values = typeof SETTINGS_FIELDS;

interface Settings {
  currentInput: string;
  values: Values;
  setValue: (newValue: Partial<Values>) => void;
  setCurrentInput: (newInput: string) => void;
}

export const useSettingsStore = create<Settings>((set, get) => ({
  currentInput: "",
  values: {
    account: { email: "", name: "" },
    personal: { city: "", country: "", firstname: "", lastname: "" },
    configs: { weekStartsOn: "" },
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
}));
