"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { LoginInputs } from "@/types";

import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default function FormLogin() {
  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<LoginInputs>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
      callbackUrl: PATH_NAMES.HOME,
      redirect: false,
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

        if (res?.ok && !res.error) {
          router.push(PATH_NAMES.HOME);
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
        classes="grid h-full grid-rows-[1fr,auto]"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        id="formLogin"
      >
        <section className="grid grid-rows-[1fr,2rem,auto] gap-3 self-center">
          <fieldset className="flex flex-col gap-4">
            <Input
              classes="border border-gray-900"
              variant="default"
              type="email"
              label="email"
              labelClasses="m-0 text-sm"
              isError={!!errors.password?.message?.trim()}
              {...register("email")}
            />
            <Input
              classes="border border-gray-900"
              variant="default"
              type="password"
              label="password"
              labelClasses="m-0 text-sm"
              isError={!!errors.password?.message?.trim()}
              {...register("password")}
            />
          </fieldset>
          {errors.password?.message && (
            <span className="text-sm font-bold text-red-500">{errors.password?.message}</span>
          )}
          <p className="row-start-3 text-xl">
            {t("account.has_account")}{" "}
            <Link
              className="font-bold text-zinc-950 underline"
              href={`/${locale}/${PATH_NAMES.REGISTER}`}
            >
              {t("account.register")}
            </Link>
          </p>
        </section>
      </Form>
    </>
  );
}
