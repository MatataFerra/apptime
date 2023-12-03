"use client";

import { FormStep } from "@/types/forms";
import { TAILWIND_COLOR } from "@/types/tailwind";

import { cn } from "@/utils/helpers/styleMerger";

import { useFormStepStore } from "@/store/useFormStepStore";

type Props = {
  color?: TAILWIND_COLOR;
  id?: FormStep;
};

function Line({ color = "bg-stone-500", id }: Props) {
  const { currentStep } = useFormStepStore();
  return (
    <div
      className={cn(
        "flex h-[1px] w-full",
        `${color ? color : id === currentStep ? "bg-black" : "bg-stone-300"}`
      )}
    />
  );
}

export default Line;
