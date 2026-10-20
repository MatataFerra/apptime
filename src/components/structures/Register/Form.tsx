"use client";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";

import Toast from "@/services/Toast";

import List from "@/components/structures/share/PasswordReqList";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";

import { usePasswordValid } from "@/providers/PasswordValidProvider";

import { authClient } from "@/utils/auth/client";
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

  const { handleSubmit, register, setFocus, control } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const passwordWatched = useWatch({ control, name: "password" }) ?? "";
  const emailWatched = useWatch({ control, name: "email" }) ?? "";

  const { updateButtonBloqued, addAttempToRegister, attempsToRegister } = usePasswordValid();
  const { passedErrors } = usePasswordErrors(passwordWatched);

  const { mutate, isPending } = useMutation({
    // Better Auth creates the user, the password account and the session
    // (autoSignIn), so there's no separate sign-in step anymore.
    mutationFn: ({ email, password }: RegisterInputs) =>
      authClient.signUp.email({ email, password, name: email.split("@")[0] }),

    onMutate() {
      //Blocking the register button
      updateButtonBloqued();

      //User is attempt to register wrongly
      addAttempToRegister();
    },

    onSuccess({ error }) {
      if (error) {
        if (error.code?.startsWith("USER_ALREADY_EXISTS")) {
          Toast({
            type: "warning",
            message: t("user_already_exist"),
            duration: 2000,
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

      Toast({
        message: t("successful"),
        type: "success",
        duration: 2000,
        itemID: "success_register",
      });

      // Full load, so the server renders with the new session.
      window.location.assign(PATH_NAMES.HOME);
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
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Create your account
          </h1>
          <p className="text-sm text-ink-muted">Start logging shifts in under a minute.</p>
        </header>
        <Stack spacing={4} orientation="vertical">
          <Input basis="basis-0" type="email" label="Email" {...register("email")} />
          <Input basis="basis-0" type="password" label="Password" {...register("password")} />
        </Stack>
        <List errors={passedErrors} password={passwordWatched} />
      </Form>
    </>
  );
}

export default RegisterForm;
