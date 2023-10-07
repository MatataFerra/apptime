"use client";

import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";

import Form from "@/components/Form";
import Input from "@/components/Input";
import List from "@/components/List/register";

import { PasswordValidContext, usePasswordValid } from "@/providers/PasswordValid";

import usePasswordErrors from "@/hooks/usePasswordErrors";

type RegisterInputs = {
  email: string;
  password: string;
  fullname: string;
};

function RegisterForm() {
  const {
    handleSubmit,
    register,
    getFieldState,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<RegisterInputs>();
  const { updateIsPasswordValid } = usePasswordValid();

  const passwordWatched = watch("password");
  const { passedErrors, isValid: isPasswordValid } = usePasswordErrors(passwordWatched);

  useEffect(() => {
    updateIsPasswordValid(isPasswordValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPasswordValid]);

  function onSubmit(data: RegisterInputs) {
    // eslint-disable-next-line no-console
    console.log({ data, isValid });
  }

  return (
    <>
      <Form
        classes="flex flex-col justify-center gap-4"
        id="registerForm"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset>
          <Input
            classes="shadow-input h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl"
            variant="default"
            type="fullname"
            label="fullname"
            labelClasses="m-0 text-sm"
            {...register("fullname")}
          />
          <Input
            classes="shadow-input h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl"
            variant="default"
            type="email"
            label="email"
            labelClasses="m-0 text-sm"
            {...register("email")}
          />
          <Input
            classes="shadow-input h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl"
            variant="default"
            type="password"
            label="password"
            labelClasses="m-0 text-sm"
            {...register("password")}
          />
        </fieldset>
        <List touchedFields={touchedFields} errors={passedErrors} />
      </Form>
    </>
  );
}

export default RegisterForm;
