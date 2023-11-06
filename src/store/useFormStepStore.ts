import { create } from "zustand";

import { FormStep, FormStepStore } from "@/types/forms";

export const useFormStepStore = create<FormStepStore>((set) => ({
  currentStep: FormStep.PERSONAL_INFO,
  setCurrentStep: (step) => {
    // This is a type guard that ensures that the step is a valid FormStep
    // before setting it. This is a good example of how to use TypeScript
    // to make your code safer.
    if (Object.values(FormStep).includes(step)) {
      return set({ currentStep: step });
    }

    return;
  },
}));
