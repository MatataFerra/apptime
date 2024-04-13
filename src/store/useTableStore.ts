import { create } from "zustand";

type TableStore = {
  // Add your store properties here
  step: "info" | "edit";
  setStep: (step: "info" | "edit") => void;
};

export const useTableStore = create<TableStore>((set) => ({
  step: "info",
  setStep: (step) => set({ step }),
}));
