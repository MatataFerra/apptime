"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
//import DOMPurify from "dompurify";
import { z } from "zod";

import db from "@/services/Database";

import { FailureApiResponse } from "@/types/api_response";

import Form from "@/components/Form";
import Input from "@/components/Input";
import List from "@/components/List/register";

import { usePasswordValid } from "@/providers/PasswordValid";

import { REGISTER_ERROR_MESSAGE } from "@/utils/constants/api_response";
import usePasswordErrors from "@/hooks/usePasswordErrors";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullname: z.string().min(2),
});

type RegisterInputs = {
  email: string;
  password: string;
  fullname: string;
};

function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { handleSubmit, register, setFocus, watch } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
  });
  const { mutate } = useMutation({
    mutationFn: db.register,
    onSuccess(data) {
      if (!data.ok) {
        setErrorMessage(REGISTER_ERROR_MESSAGE.invalid_body);
      }
    },
  });
  const { updateIsPasswordValid } = usePasswordValid();

  const passwordWatched = watch("password");
  const { passedErrors, isValid: isPasswordValid } = usePasswordErrors(passwordWatched);

  useEffect(() => {
    updateIsPasswordValid(isPasswordValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPasswordValid]);

  async function onSubmit(data: RegisterInputs) {
    if (data.fullname.length === 0) {
      return setFocus("fullname");
    }
    if (data.email.length === 0) {
      return setFocus("email");
    }
    if (data.password.length === 0) {
      return setFocus("password");
    }

    mutate({
      email: data.email,
      password: data.password,
      fullname: data.fullname,
    });
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
        <List errors={passedErrors} password={passwordWatched} />
      </Form>
      <p className="text-red-500" dangerouslySetInnerHTML={{ __html: errorMessage }}></p>
    </>
  );
}

export default RegisterForm;
