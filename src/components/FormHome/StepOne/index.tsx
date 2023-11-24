"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useFormStore } from "@/store/useFormStore";

function StepOne() {
  const { register, setFocus } = useForm();
  const { setUser, user, formErrors } = useFormStore();

  useEffect(() => {
    if (formErrors.name) return setFocus("name");
  }, [formErrors.name, setFocus]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setUser({ [name]: value });
  }

  return (
    <>
      <Stack orientation="vertical" classes="mt-16" spacing={8}>
        <Input
          isRequired
          isError={formErrors.name}
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
