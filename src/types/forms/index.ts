export enum FormStep {
  PERSONAL_INFO = "personalInfo",
  PAY_INFO = "payInfo",
  SHIFT_INFO = "shiftInfo",
}

export type FormStepStore = {
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
};
