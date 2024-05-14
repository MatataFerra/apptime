"use client";

import { FormStep } from "@/types/forms";

import Badge from "@/components/ui/Badge";
import Text from "@/components/ui/Text";

import { useFormStepStore } from "@/store/useFormStepStore";

type Props = {
  index: number;
  id: FormStep;
  title: string;
};

function RoundBadge({ index, id, title }: Props) {
  const { currentStep } = useFormStepStore();
  return (
    <>
      <Badge text={(index + 1).toString()} state={id === currentStep ? "active" : "inactive"} />
      <Text
        as="span"
        classes={`text-xs ${id === currentStep ? "font-bold text-black" : "text-stone-300"}`}
      >
        {title}
      </Text>
    </>
  );
}

export default RoundBadge;
