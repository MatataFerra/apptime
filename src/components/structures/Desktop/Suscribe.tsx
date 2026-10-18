"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import api from "@/services/Api";

import { Inputs, SuscribeSchema } from "@/types";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function Suscribe() {
  const t = useTranslations("no-mobile");

  const mutation = useMutation({
    mutationFn: api.createWaitingList.bind(api),
    onError: (_) => {
      setError("email", {
        message: "Something went wrong, please try again later.",
      });
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitSuccessful, isSubmitting, isValid, isDirty },
  } = useForm<Inputs>({
    resolver: zodResolver(SuscribeSchema),
  });

  function onSubmit(event: Inputs) {
    clearErrors("email");

    mutation.mutate(event.email);
  }

  function onKeyPress(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  }

  return (
    <article className="h-44 space-y-4 rounded-lg bg-black bg-opacity-80 bg-clip-padding px-8 py-4 backdrop-blur-xs backdrop-filter">
      <Text classes="text-lg text-white">{t("subscription.notify_message")}</Text>

      <Stack
        as="form"
        grid
        cols={"1fr auto"}
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={onKeyPress}
      >
        <Input
          placeholder="username@email.com"
          classes="h-full w-full text-sm shadow-xs"
          type="text"
          {...register("email")}
        />
        <Button
          variant={"gradient_primary"}
          classes="transform animate-text p-1 transition-transform active:scale-75"
        >
          <Text classes="font-black text-white">Notify Me</Text>
        </Button>
      </Stack>
      {isSubmitting && <Loader.spinner />}

      {!isValid && (
        <Text classes="animate-shake text-sm text-red-700">{errors.email?.message}</Text>
      )}

      {isSubmitSuccessful && <Text variant="success">{t("subscription.success_message")}</Text>}
    </article>
  );
}

export default Suscribe;
