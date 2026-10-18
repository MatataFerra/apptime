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
        <section className="grid grid-rows-[1fr_2rem_auto] gap-4 self-center">
          <fieldset className="flex flex-col gap-4">
            <Input
              variant="default"
              type="email"
              label="email"
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              {...register("email")}
            />
            <Input
              type="password"
              label="password"
              basis="basis-0"
              isError={!!errors.password?.message?.trim()}
              description={errors.password?.message}
              {...register("password")}
            />
          </fieldset>
          <div className="flex items-center justify-between text-base">
            <p>
              <Link
                className="font-bold text-ink underline"
                href={`/${locale}${PATH_NAMES.REGISTER}`}
              >
                register new account
              </Link>
            </p>
            <p>
              <Link className="text-ink underline" href={`/${locale}${PATH_NAMES.RESET_PASSWORD}`}>
                forgotten password?
              </Link>
            </p>
          </div>
        </section>
      </Form>
    </>
  );
}
