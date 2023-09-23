"use client";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import pass from "@/services/Auth/password";

import LoginFooter from "@/components/Footer/login";
import Form from "@/components/Form";
import Input from "@/components/Input";

import usePassword from "@/hooks/usePassword";

import List from "./List";

interface LoginInputs {
  email: string;
  password: string;
}

export default function FormLogin() {
  const {
    handleSubmit,
    register,
    formState: { touchedFields },
    watch,
    setFocus,
  } = useForm<LoginInputs>();
  const passWatched = watch("password");
  const passwordChecks = usePassword(passWatched);

  function onSubmit(data: LoginInputs) {
    if (data.email.length === 0 || data.password.length === 0) {
      return setFocus("email");
    }
    // eslint-disable-next-line no-console
    console.log({ data });
  }

  return (
    <>
      <Form
        classes="grid h-full grid-rows-[1fr,auto]"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section className="grid grid-rows-[1fr,8rem] gap-3 self-center">
          <fieldset className="flex flex-col gap-4">
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
          <span className="mt-1 text-sm">
            <span className="text-gray-500">Password must contain:</span>
            <List touchedFields={touchedFields} errors={passwordChecks} />
          </span>
        </section>
        <LoginFooter classes="self-end" />
      </Form>
    </>
  );
}
