"use client";

import { FormStep } from "@/types/forms";

import StepOne from "@/components/FormHome/StepOne";
import StepThree from "@/components/FormHome/StepThree";
import StepTwo from "@/components/FormHome/StepTwo";

import { useFormStepStore } from "@/store/useFormStepStore";

function Content() {
  const { currentStep } = useFormStepStore();
  return (
    <>
      {currentStep === FormStep.PERSONAL_INFO && <StepOne />}
      {currentStep === FormStep.PAY_INFO && <StepTwo />}
      {currentStep === FormStep.SHIFT_INFO && <StepThree />}
    </>
  );
}

export default Content;
