"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useRadioInput } from "@/store/useRadioInput";

type Props = {
  radioGroupName: string;
};

function RadioGroup({ radioGroupName }: Props) {
  const { register } = useForm();
  const { radioInputValue, setRadioInputValue } = useRadioInput();
  const [isActive, setIsActive] = useState(false);

  function onChangeInput(e: any) {
    const { value } = e.target;

    setRadioInputValue({
      ...radioInputValue,
      [radioGroupName]: !!Number(value),
    });

    setIsActive(!!Number(value));
  }

  return (
    <Stack orientation="vertical" as="fieldset" data-radio-state={`${isActive}`}>
      <Input
        label="Yes"
        value={1}
        containerClasses="items-center flex flex-row"
        labelClasses="order-2 text-base"
        type="radio"
        classes="order-1"
        {...register(radioGroupName, {
          onChange(e) {
            onChangeInput(e);
          },
        })}
      />
      <Input
        defaultChecked
        label="No"
        value={0}
        containerClasses="items-center flex flex-row"
        labelClasses="order-2 text-base"
        type="radio"
        classes="order-1"
        {...register(radioGroupName)}
      />
    </Stack>
  );
}

export default RadioGroup;
