"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Profile } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";

import { FormStep } from "@/types/forms";
import { FormStoreData } from "@/types/store";

import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";
import Loader from "@/components/ui/Loader";

import onSubmitServerAction from "@/server-actions/home-form";
import { useFormStepStore } from "@/store/useFormStepStore";
import { useFormStore } from "@/store/useFormStore";

function Buttons() {
  const { setCurrentStep, currentStep } = useFormStepStore();
  const { replace } = useRouter();
  const { user, profile, setFormErrors, formErrors, isFormErrorsInitialized, hasErrors } =
    useFormStore();
  const { handleSubmit } = useForm<FormStoreData>({
    values: {
      user,
      profile,
    },
  });

  useEffect(() => {
    if (!isFormErrorsInitialized) return;
    if (!hasErrors()) return;
    if (formErrors.name) return setCurrentStep(FormStep.PERSONAL_INFO);
    return setCurrentStep(FormStep.PAY_INFO);
  }, [formErrors, hasErrors, isFormErrorsInitialized, setCurrentStep]);

  function OnNextStep() {
    setCurrentStep(currentStep + 1);
  }

  function OnPrevStep() {
    setCurrentStep(currentStep - 1);
  }

  function OnSubmit(data: FormStoreData) {
    setFormErrors({ data: { user: data.user, profile: data.profile } });

    if (hasErrors()) {
      return Toast({
        type: "error",
        message: "😮 Something has gone wrong",
        description: "Please check the form and try again",
        duration: 2000,
        classes: "[&>div>div]:text-xl",
      });
    }

    Toast({
      type: "info",
      message: "⏳ We are creating your profile",
      action: <Loader.spinner />,
      duration: 5000,
    });

    onSubmitServerAction(data).then((profile: Profile | null) => {
      if (!profile) {
        return Toast({
          type: "error",
          message: "😮 Something has gone wrong",
          duration: 3000,
          action: (
            <Button as="div" variant="white" classes="remove_button_highlight border-none">
              <Link href="/">Go Home</Link>
            </Button>
          ),
        });
      }

      Toast({
        type: "success",
        message: "😎 Your profile has been created",
        description: "You will be redirected to the home page",
        duration: 3000,
        action: <Loader.spinner />,
        onAnimationEnd: () => replace("/"),
      });
    });
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
