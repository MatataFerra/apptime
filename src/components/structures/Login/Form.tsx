"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { LoginInputs } from "@/types";

import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";

import { PATH_NAMES } from "@/utils/constants/pathnames";

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
  const locale = useLocale();
  const t = useTranslations("login");

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

    signIn("credentials", {
      callbackUrl: searchParams.get("redirect") ?? PATH_NAMES.HOME,
      redirect: true,
      password,
      email,
    })
      .then((res) => {
        if (res?.error) {
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
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Log in</h1>
            <p className="text-sm text-ink-muted">Your hours and pay, right where you left them.</p>
          </header>
          <fieldset className="flex flex-col gap-4">
            <Input
              variant="default"
              type="email"
              label="Email"
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              {...register("email")}
            />
            <Input
              type="password"
              label="Password"
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              description={errors.password?.message}
              {...register("password")}
            />
          </fieldset>
          <div className="flex items-center justify-between text-sm">
            <Link
              className="font-medium text-accent underline-offset-4 hover:underline"
              href={`/${locale}${PATH_NAMES.REGISTER}`}
            >
              Register an account
            </Link>
            <Link
              className="text-ink-muted underline-offset-4 hover:underline"
              href={`/${locale}${PATH_NAMES.RESET_PASSWORD}`}
            >
              Forgot password?
            </Link>
          </div>
        </section>
      </Form>
    </>
  );
}
