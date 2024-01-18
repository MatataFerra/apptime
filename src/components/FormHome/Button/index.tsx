"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Profile } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormStep } from "@/types/forms";
import { FormStoreData } from "@/types/store";

import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";
import Loader from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast/use-toast";

import onSubmitServerAction from "@/server-actions/home-form";
import { useFormStepStore } from "@/store/useFormStepStore";
import { useFormStore } from "@/store/useFormStore";

function Buttons() {
  const { setCurrentStep, currentStep } = useFormStepStore();
  const { replace } = useRouter();
  const { toast } = useToast();
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
      return toast({
        title: "😮 Something has gone wrong",
        description: "Please check the form and try again",
        variant: "destructive",
        duration: 2000,
        className: "[&>div>div]:text-xl",
      });
    }

    toast({
      title: "⏳ We are creating your profile",
      action: <Loader.spinner />,
      duration: 5000,
    });

    onSubmitServerAction(data).then((profile: Profile | null) => {
      if (!profile) {
        return toast({
          title: `😮 Something has gone wrong`,
          variant: "destructive",
          duration: 3000,

          action: (
            <Button as="div" variant="white" classes="remove_button_highlight border-none">
              <Link href="/">Go Home</Link>
            </Button>
          ),
        });
      }

      toast({
        title: "😎 Your profile has been created",
        description: "You will be redirected to the home page",
        duration: 3000,
        className: "bg-green-200",
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
