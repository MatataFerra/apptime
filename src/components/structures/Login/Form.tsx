"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { LoginInputs } from "@/types";

import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";

import { authClient } from "@/utils/auth/client";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { safeRedirectPath } from "@/utils/helpers/safeRedirect";

import { Link } from "@/i18n/navigation";

export default function FormLogin() {
  const searchParams = useSearchParams();

  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<LoginInputs>();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth.login");
  const tf = useTranslations("auth.fields");

  function onSubmit({ email, password }: LoginInputs) {
    setLoading(true);
    if (email.trim().length === 0) {
      setFocus("email");
      setLoading(false);

      return;
    }
    if (password.trim().length === 0) {
      setFocus("password");
      setLoading(false);

      return;
    }

    authClient.signIn
      .email({ email, password })
      .then(({ error }) => {
        if (!error) {
          // Full load, so the server renders with the new session.
          // Only same-site paths are followed.
          window.location.assign(safeRedirectPath(searchParams.get("redirect"), PATH_NAMES.HOME));
          return;
        }
        if (error) {
          return setError(
            "password",
            {
              message: t("wrong_password"),
            },
            {
              shouldFocus: true,
            }
          );
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <Loader
        loading={loading}
        type="spinner"
        loaderClasses="spinner h-12 w-12"
        loaderContainerClasses="flex h-full justify-center items-center"
      />

      <Form
        classes="grid h-full grid-rows-[1fr_auto]"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        id="formLogin"
      >
        <section className="flex flex-col gap-6 self-center">
          <header className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {t("title")}
            </h1>
            <p className="text-sm text-ink-muted">{t("subtitle")}</p>
          </header>
          <fieldset className="flex flex-col gap-4">
            <Input
              variant="default"
              type="email"
              label={tf("email")}
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              {...register("email")}
            />
            <Input
              type="password"
              label={tf("password")}
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              description={errors.password?.message}
              {...register("password")}
            />
          </fieldset>
          <div className="flex items-center justify-between text-sm">
            <Link
              className="font-medium text-accent underline-offset-4 hover:underline"
              href={PATH_NAMES.REGISTER}
            >
              {t("register_link")}
            </Link>
            <Link
              className="text-ink-muted underline-offset-4 hover:underline"
              href={PATH_NAMES.RESET_PASSWORD}
            >
              {t("forgot_link")}
            </Link>
          </div>
        </section>
      </Form>
    </>
  );
}
