import { create } from "zustand";

import { FormStep, FormStepStore } from "@/types/forms";

export const useFormStepStore = create<FormStepStore>((set) => ({
  currentStep: FormStep.PERSONAL_INFO,
  setCurrentStep: (step) => set({ currentStep: step }),
}));
