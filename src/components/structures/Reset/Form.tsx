"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";

import Toast from "@/services/Toast";

import List from "@/components/structures/share/PasswordReqList";
import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import usePasswordErrors from "@/hooks/usePasswordErrors";

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
  const {
    handleSubmit,
    register,
    setFocus,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ResetInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const { token } = useParams<Params>();
  const passwordWatched = watch("password");
  const { passedErrors } = usePasswordErrors(passwordWatched);
  const [changeType, setChangeType] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(data: ResetInputs) {
    if (data.password.length === 0) {
      return setFocus("password");
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        message: "Password are different",
      });
      return setFocus("confirmPassword");
    }

    onResetPassword({
      password: data.password,
      token: token,
    }).then((res) => {
      if (!res) {
        Toast({
          type: "error",
          message: "Something went wrong, please try again",
          duration: 3000,
        });

        return;
      }

      if (!res.response) {
        Toast({
          type: "error",
          message: res.message ?? "Something went wrong, please try again",
          duration: 3000,
        });

        return;
      }

      Toast({
        type: "success",
        message: res.message ?? "Your password has been reseted succefully",
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
            label="password"
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
            label="confirm password"
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
