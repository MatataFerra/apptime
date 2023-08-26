"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Text from "@/components/Text";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SuscribeSchema = z.object({
  email: z.string().email(),
});

type Inputs = z.infer<typeof SuscribeSchema>;

function Suscribe() {
  const t = useTranslations("no-mobile");
  function createWaitingList(email: Inputs["email"]) {
    return fetch("/api/waiting-list", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const mutation = useMutation({
    mutationFn: createWaitingList,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Inputs>({
    resolver: zodResolver(SuscribeSchema),
  });

  function onSubmit(event: Inputs) {
    mutation.mutate(event.email);
  }

  return (
    <article className="h-44 space-y-4 rounded-lg bg-gray-900 bg-opacity-80 bg-clip-padding px-8 py-4 backdrop-blur-sm backdrop-filter">
      <Text classes="text-lg text-white">{t("subscription.notifyMessage")}</Text>

      <form className="flex justify-between gap-2" onSubmit={handleSubmit(onSubmit)}>
        <Input
          variants="default"
          placeholder="username@email.com"
          classes="w-full"
          type="text"
          {...register("email")}
        />
        <Button
          variants="gradient"
          classes="transform animate-text p-1 transition-transform active:scale-75"
        >
          <div className="items-center justify-center rounded-[inherit] bg-gray-800 px-3 py-1 transition-all hover:bg-gray-900">
            <Text classes="font-black text-white">Notify Me</Text>
          </div>
        </Button>
      </form>
      {!isSubmitSuccessful ? (
        <Text classes="animate-shake text-sm text-red-700">{errors.email?.message}</Text>
      ) : mutation.isSuccess ? (
        <Text variants="success">{t("subscription.successMessage")}</Text>
      ) : null}
    </article>
  );
}

export default Suscribe;
