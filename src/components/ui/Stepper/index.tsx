"use client";

import { Fragment } from "react";

import { FormStep } from "@/types/forms";

import Badge from "@/components/ui/Badge";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useFormStepStore } from "@/store/useFormStepStore";

const ARRAY = [
  {
    id: FormStep.PERSONAL_INFO,
    title: "Personal info",
  },
  {
    id: FormStep.PAY_INFO,
    title: "Pay info",
  },
  {
    id: FormStep.SHIFT_INFO,
    title: "Shift info",
  },
];

type Props = {
  steps?: {
    id: FormStep;
    title: string;
  }[];
};

function Stepper({ steps = ARRAY }: Props) {
  const { currentStep } = useFormStepStore();

  return (
    <>
      <nav className="flex w-full flex-row items-center justify-between gap-4">
        {steps.map(({ title, id }, index) => (
          <Fragment key={crypto.randomUUID()}>
            <Stack
              alignItems="center"
              justifyContent="center"
              classes="flex w-full flex-row gap-2 text-xs"
            >
              <Badge
                text={(index + 1).toString()}
                state={id === currentStep ? "active" : "inactive"}
              />
              <Text
                as="span"
                classes={id === currentStep ? "font-bold text-black" : "text-stone-300"}
              >
                {title}
              </Text>
            </Stack>
            {index !== steps.length - 1 && (
              <Line color={id === currentStep ? "bg-black" : "bg-stone-300"} />
            )}
          </Fragment>
        ))}
      </nav>
    </>
  );
}

export default Stepper;
