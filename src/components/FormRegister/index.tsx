"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { z } from "zod";

import api from "@/services/Api";

import List from "@/components/ListRegister";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";
import { useToast } from "@/components/ui/Toast/use-toast";

import { usePasswordValid } from "@/providers/PasswordValid";

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
  const { toast } = useToast();
  const t = useTranslations("register");

  const { handleSubmit, register, setFocus, watch } = useForm<RegisterInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const passwordWatched = watch("password");
  const emailWatched = watch("email");

  const { updateButtonBloqued, addAttempToRegister, attempsToRegister } = usePasswordValid();
  const { passedErrors } = usePasswordErrors(passwordWatched);

  const { mutate, isLoading } = useMutation({
    mutationFn: api.register,

    onMutate() {
      //Blocking the register button
      updateButtonBloqued();

      //User is attempt to register wrongly
      addAttempToRegister();
    },

    onSuccess(data) {
      if (!data.response) {
        // Error handling
        const response = data;
        if (response.error.type_error === "UserAlreadyExists") {
          toast({
            title: t("user_already_exist"),
            duration: 2000,
            className: "bg-yellow-200",
            action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
          });

          setTimeout(() => {
            router.push(PATH_NAMES.LOGIN);
          }, 1500);

          return;
        }

        return toast({
          title: t("invalid_body"),
          variant: "destructive",
          duration: 1500,
        });
      }

      // ui notif
      toast({
        title: t("successful"),
        className: "bg-green-400",
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
          toast({
            title: t("unexpected_error_after_register"),
            variant: "destructive",
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
      return toast({
        title: t("max_attemps_to_register"),
        variant: "destructive",
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
        loading={isLoading}
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
        <Stack as="fieldset" spacing={4} orientation="vertical">
          <Input
            classes="h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl shadow-input"
            variant="default"
            type="email"
            label="email"
            labelClasses="m-0 text-sm"
            {...register("email")}
          />
          <Input
            classes="h-[69px] w-full rounded-md border border-gray-900 bg-white text-2xl shadow-input"
            variant="default"
            type="password"
            label="password"
            labelClasses="m-0 text-sm"
            {...register("password")}
          />
        </Stack>
        <List errors={passedErrors} password={passwordWatched} />
      </Form>
    </>
  );
}

export default RegisterForm;
