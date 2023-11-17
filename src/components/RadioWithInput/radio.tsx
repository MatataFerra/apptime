"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { RadioInputsState, useRadioInput } from "@/store/useRadioInput";

type Props = {
  radioGroupName: keyof RadioInputsState;
};

function RadioGroup({ radioGroupName }: Props) {
  const { register } = useForm();
  const { radioInputValue, setRadioInputValue, isInputActive, __INPUT_VALUE_MATCHER } =
    useRadioInput();

  const matcher =
    __INPUT_VALUE_MATCHER[
      String(isInputActive(radioGroupName)) as unknown as keyof typeof __INPUT_VALUE_MATCHER
    ];

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    setRadioInputValue({
      ...radioInputValue,
      [radioGroupName]: !!Number(value),
    });
  }

  return (
    <Stack orientation="vertical" as="fieldset">
      <Input
        checked={matcher === "1"}
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
        checked={matcher === "0"}
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
