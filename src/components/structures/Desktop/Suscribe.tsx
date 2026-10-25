"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import api from "@/services/Api";

import { Inputs, SuscribeSchema } from "@/types";

import Loader from "@/components/ui/Loader";

import useZodI18n from "@/hooks/useZodI18n";

function Suscribe() {
  useZodI18n();
  const t = useTranslations("no_mobile");

  const mutation = useMutation({
    mutationFn: api.createWaitingList.bind(api),
    onError: (_) => {
      setError("email", {
        message: t("subscription.error"),
      });
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitSuccessful, isSubmitting },
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
    <article className="flex flex-col gap-3 rounded-xl bg-surface-inverse p-5 text-ink-inverse">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t("subscription.title")}</h2>
        <p className="text-[0.9375rem] text-ink-inverse/70">{t("subscription.notify_message")}</p>
      </div>

      {isSubmitSuccessful && mutation.isSuccess ? (
        <p
          role="status"
          className="flex h-12 items-center text-[0.9375rem] font-semibold text-live"
        >
          {t("subscription.success_message")}
        </p>
      ) : (
        <form
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={onKeyPress}
          noValidate
        >
          <label htmlFor="waitlist-email" className="sr-only">
            {t("subscription.email_label")}
          </label>
          <input
            id="waitlist-email"
            type="email"
            autoComplete="email"
            placeholder={t("subscription.placeholder")}
            aria-invalid={!!errors.email}
            className="h-12 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-[0.9375rem] text-ink-inverse outline-hidden transition-colors placeholder:text-ink-inverse/45 focus:border-live"
            {...register("email")}
          />
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex h-12 items-center gap-2 rounded-xl bg-live px-5 text-[0.9375rem] font-semibold text-surface-inverse transition-transform active:scale-95 disabled:opacity-60"
          >
            {mutation.isPending ? <Loader.spinner bg="text-ink/30" spinColor="fill-ink" /> : null}
            {t("subscription.submit")}
          </button>
        </form>
      )}

      {errors.email?.message ? (
        <p className="text-sm font-medium text-destructive-bright">{errors.email.message}</p>
      ) : null}
    </article>
  );
}

export default Suscribe;
