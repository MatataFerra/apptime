"use client";

import { MouseEvent } from "react";
import { useForm } from "react-hook-form";

import { FormStep } from "@/types/forms";

import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";

import { useFormStepStore } from "@/store/useFormStepStore";
import { useFormStore } from "@/store/useFormStore";

function Buttons() {
  const { setCurrentStep, currentStep } = useFormStepStore();
  const { user, profile } = useFormStore();
  const { handleSubmit } = useForm({
    values: {
      user,
      profile,
    },
  });

  function OnNextStep() {
    setCurrentStep(currentStep + 1);
  }

  function OnPrevStep() {
    setCurrentStep(currentStep - 1);
  }

  function OnSubmit(data: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <Form
      classes={`flex h-16 flex-row self-end ${
        currentStep === FormStep.PERSONAL_INFO ? "justify-end" : "justify-between"
      }`}
      onSubmit={handleSubmit(OnSubmit)}
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
        <Button variant="black" classes="remove_button_highlight">
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
