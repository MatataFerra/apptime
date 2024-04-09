"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import RadioWithInput from "@/components/RadioWithInput";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { radioInputHandleValue } from "@/utils/helpers/radioInputHandleValue";

import { useFormStore } from "@/store/useFormStore";
import { useRadioInput } from "@/store/useRadioInput";

function StepThree() {
  const { register } = useForm();
  const { setProfile, profile } = useFormStore();
  const { value, setValue } = useRadioInput();

  const memoValue = useMemo(() => radioInputHandleValue(Number(value)), [value]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name === "unpaidBreaks") {
      setValue(value);
    }

    setProfile({ [name]: Number(value) });
  }

  return (
    <>
      <Stack grid cols={1} classes="w-full" spacing={4}></Stack>
    </>
  );
}

export default StepThree;
