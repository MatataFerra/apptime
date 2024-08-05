"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { z } from "zod";

import Toast from "@/services/Toast";

import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import onSendEmailToResetPassword from "@/server-actions/send-email-reset-password";

const RegisterSchema = z.object({
  email: z.string().email(),
});

type ResetInputs = {
  email: string;
};

function ResetForm() {
  const router = useRouter();
  const locale = useLocale();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetInputs>({
    resolver: zodResolver(RegisterSchema),
    shouldFocusError: true,
  });

  async function onSubmit(data: ResetInputs) {
    onSendEmailToResetPassword(data.email, locale).then((res) => {
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
        message: res.message ?? "All good!",
        duration: 1500,
      });

      router.replace(PATH_NAMES.RESET_SUCCESS);
    });
  }

  return (
    <>
      <Form
        classes="mb-4 flex flex-col justify-center gap-4"
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        id="emailReset"
      >
        <Stack spacing={4} orientation="vertical">
          <Input
            basis="basis-0"
            type="email"
            label="Please enter your email"
            placeholder="username@gmail.com"
            isError={!!errors["email"]?.message}
            {...register("email")}
          />
        </Stack>
      </Form>
    </>
  );
}

export default ResetForm;
