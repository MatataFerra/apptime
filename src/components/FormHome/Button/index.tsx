"use client";

import { MouseEvent } from "react";

import { FormStep } from "@/types/forms";

import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";

import { useFormStepStore } from "@/store/useFormStepStore";

function Buttons() {
  const { setCurrentStep, currentStep } = useFormStepStore();

  function OnNextStep(e: MouseEvent<HTMLButtonElement>) {
    // e.preventDefault();
    setCurrentStep(currentStep + 1);
  }

  function OnPrevStep() {
    setCurrentStep(currentStep - 1);
  }
  return (
    <Form
      classes={`flex flex-row ${
        currentStep === FormStep.PERSONAL_INFO ? "justify-end" : "justify-between"
      }`}
    >
      {currentStep !== FormStep.PERSONAL_INFO && (
        <Button
          type="button"
          variant="white"
          classes="remove_button_highlight border-none"
          onClick={OnPrevStep}
        >
          {"<"} Back
        </Button>
      )}

      {currentStep === FormStep.SHIFT_INFO && (
        <Button variant="black" classes="remove_button_highlight" onClick={OnNextStep}>
          Submit
        </Button>
      )}

      {currentStep !== FormStep.SHIFT_INFO && (
        <Button type="button" variant="teal" classes="remove_button_highlight" onClick={OnNextStep}>
          Next {">"}
        </Button>
      )}
    </Form>
  );
}

export default Buttons;
