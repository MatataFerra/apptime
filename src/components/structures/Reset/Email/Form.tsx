"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

import Toast from "@/services/Toast";

import Form from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import useZodI18n from "@/hooks/useZodI18n";

import { useRouter } from "@/i18n/navigation";
import onSendEmailToResetPassword from "@/server-actions/send-email-reset-password";

const RegisterSchema = z.object({
  email: z.string().email(),
});

type ResetInputs = {
  email: string;
};

function ResetForm() {
  useZodI18n();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.forgot");
  const te = useTranslations("errors");
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
        message: t("email_sent"),
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
            label={t("email_label")}
            placeholder={t("email_placeholder")}
            isError={!!errors["email"]?.message}
            {...register("email")}
          />
        </Stack>
      </Form>
    </>
  );
}

export default ResetForm;
