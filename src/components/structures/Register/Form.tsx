"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import api from "@/services/Api";
import Toast from "@/services/Toast";

import { ApiResponse } from "@/types/api_response";

import List from "@/components/structures/share/PasswordReqList";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";

import { usePasswordValid } from "@/providers/PasswordValidProvider";

import { MAX_ATTEMPTS_TO_REGISTER } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import usePasswordErrors from "@/hooks/usePasswordErrors";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type RegisterInputs = {
  email: string;
  password: string;
};

function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("register");

  const { handleSubmit, register, setFocus, watch } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const passwordWatched = watch("password");
  const emailWatched = watch("email");

  const { updateButtonBloqued, addAttempToRegister, attempsToRegister } = usePasswordValid();
  const { passedErrors } = usePasswordErrors(passwordWatched);

  const { mutate, isPending } = useMutation({
    mutationFn: api.register.bind(api),

    onMutate() {
      //Blocking the register button
      updateButtonBloqued();

      //User is attempt to register wrongly
      addAttempToRegister();
    },

    onSuccess(data) {
      const res = data as ApiResponse<User>;
      if (!res.response) {
        // Error handling
        if (res.error.type_error === "UserAlreadyExists") {
          Toast({
            type: "warning",
            message: t("user_already_exist"),
            duration: 2000,
            action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
          });

          setTimeout(() => {
            router.push(PATH_NAMES.LOGIN);
          }, 1500);

          return;
        }

        return Toast({
          message: t("invalid_body"),
          type: "error",
          duration: 1500,
        });
      }

      // ui notif
      Toast({
        message: t("successful"),
        type: "success",
        duration: 2000,
        itemID: "success_register",
      });

      //Login with the credentials and redirect to the home
      signIn("credentials", {
        redirect: false,
        callbackUrl: PATH_NAMES.HOME,
        email: emailWatched,
        password: passwordWatched,
      }).then((res) => {
        if (res?.error) {
          // Error handling with login
          Toast({
            message: t("unexpected_error_after_register"),
            type: "error",
          });

          return router.push(PATH_NAMES.LOGIN);
        }

        if (res?.ok && !res.error) {
          router.push(PATH_NAMES.HOME);
        }
      });
    },

    onSettled() {
      // Deblock the register button
      updateButtonBloqued();
    },
  });

  async function onSubmit(data: RegisterInputs) {
    if (data.email.length === 0) {
      return setFocus("email");
    }
    if (data.password.length === 0) {
      return setFocus("password");
    }

    if (attempsToRegister === MAX_ATTEMPTS_TO_REGISTER) {
      // Block the button
      updateButtonBloqued();
      return Toast({
        message: t("max_attemps_to_register"),
        type: "error",
        duration: 2000,
      });
    }

    mutate({
      email: data.email,
      password: data.password,
    });
  }

  return (
    <>
      <Loader
        loading={isPending}
        type="spinner"
        loaderClasses="spinner h-12 w-12"
        loaderContainerClasses="flex h-full justify-center items-center"
      />
      <Form
        classes="mb-4 flex flex-col justify-center gap-4"
        id="registerForm"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={4} orientation="vertical">
          <Input basis="basis-0" type="email" label="email" {...register("email")} />
          <Input basis="basis-0" type="password" label="password" {...register("password")} />
        </Stack>
        <List errors={passedErrors} password={passwordWatched} />
      </Form>
    </>
  );
}

export default RegisterForm;
