"use client";

import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useFormStore } from "@/store/useFormStore";

function StepOne() {
  const { register } = useForm();
  const { setUser, user } = useFormStore();

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setUser({ [name]: value });
  }

  return (
    <>
      <Stack orientation="vertical" classes="mt-16" spacing={8}>
        <Input
          label="name"
          labelClasses="text-sm"
          {...register("name", {
            onChange: onInputChange,
            value: user.name,
          })}
        />
        <Input
          label="surname"
          labelClasses="text-sm"
          {...register("surname", {
            onChange: onInputChange,
            value: user.surname,
          })}
        />
      </Stack>
    </>
  );
}

export default StepOne;
