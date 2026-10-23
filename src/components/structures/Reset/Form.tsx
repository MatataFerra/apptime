"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";

import Toast from "@/services/Toast";

import List from "@/components/structures/share/PasswordReqList";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import usePasswordErrors from "@/hooks/usePasswordErrors";

import { useRouter } from "@/i18n/navigation";
import onResetPassword from "@/server-actions/reset-password";

const RegisterSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

type ResetInputs = {
  password: string;
  confirmPassword: string;
};

type Params = {
  token: string;
};

function ResetForm() {
  const router = useRouter();
  const t = useTranslations("auth.reset");
  const tf = useTranslations("auth.fields");
  const te = useTranslations("errors");
  const {
    handleSubmit,
    register,
    setFocus,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ResetInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const { token } = useParams<Params>();
  const passwordWatched = useWatch({ control, name: "password" }) ?? "";
  const { passedErrors } = usePasswordErrors(passwordWatched);
  const [changeType, setChangeType] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(data: ResetInputs) {
    if (data.password.length === 0) {
      return setFocus("password");
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        message: t("mismatch"),
      });
      return setFocus("confirmPassword");
    }

    onResetPassword({
      password: data.password,
      token: token,
    }).then((res) => {
      if (!res?.response) {
        Toast({
          type: "error",
          message: te(res?.error ?? "generic"),
          duration: 3000,
        });

        return;
      }

      Toast({
        type: "success",
        message: t("success"),
        duration: 1500,
      });

      router.replace(PATH_NAMES.LOGIN);
    });
  }

  return (
    <>
      <Form
        classes="mb-4 flex flex-col justify-center gap-4"
        id="resetPassword"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack spacing={4} orientation="vertical">
          <Input
            basis="basis-0"
            type={changeType ? "text" : "password"}
            label={tf("password")}
            showPassword
            onShowPasswordChange={() => setChangeType((prev) => !prev)}
            {...register("password", {
              onChange() {
                clearErrors("confirmPassword");
              },
            })}
          />
          <Input
            basis="basis-0"
            type={showConfirm ? "text" : "password"}
            label={tf("confirm_password")}
            isError={!!errors.confirmPassword?.message}
            showPassword
            onShowPasswordChange={() => setShowConfirm((prev) => !prev)}
            description={
              errors.confirmPassword?.message ? errors.confirmPassword?.message : undefined
            }
            {...register("confirmPassword", {
              onChange() {
                clearErrors("confirmPassword");
              },
            })}
          />
        </Stack>
        <List errors={passedErrors} password={passwordWatched} />
      </Form>
    </>
  );
}

export default ResetForm;
