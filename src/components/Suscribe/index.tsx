"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import db from "@/services/Database";

import { Inputs, SuscribeSchema } from "@/types";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import Text from "@/components/ui/Text";

function Suscribe() {
  const t = useTranslations("no-mobile");

  const mutation = useMutation({
    mutationFn: db.createWaitingList,
  });
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitSuccessful, isSubmitting, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(SuscribeSchema),
  });

  function onSubmit(event: Inputs) {
    mutation.mutate(event.email);
  }

  function onKeyPress(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  }

  return (
    <article className="h-44 space-y-4 rounded-lg bg-black bg-opacity-80 bg-clip-padding px-8 py-4 backdrop-blur-sm backdrop-filter">
      <Text classes="text-lg text-white">{t("subscription.notify_message")}</Text>

      <form
        className="flex justify-between gap-2"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={onKeyPress}
      >
        <Input
          variant="default"
          placeholder="username@email.com"
          classes="w-full"
          type="text"
          {...register("email")}
        />
        <Button
          variant="gradient"
          classes="transform animate-text p-1 transition-transform active:scale-75"
        >
          <div className="items-center justify-center rounded-[inherit] bg-gray-800 px-3 py-1 transition-all hover:bg-gray-900">
            <Text classes="font-black text-white">Notify Me</Text>
          </div>
        </Button>
      </form>
      {isSubmitting && <Loader.spinner />}

      {!isValid && (
        <Text classes="animate-shake text-sm text-red-700">{errors.email?.message}</Text>
      )}

      {isSubmitSuccessful && <Text variant="success">{t("subscription.success_message")}</Text>}
    </article>
  );
}

export default Suscribe;
