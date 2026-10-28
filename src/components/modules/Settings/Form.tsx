"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

import AccountInputs from "@/components/structures/Settings/Account/Inputs";
import PersonalInputs from "@/components/structures/Settings/Personal/Inputs";
import { Section } from "@/components/structures/Settings/Preferences/Section";
import FormBase from "@/components/ui/Form";

import { useAuthSession } from "@/providers/Session";

import useSettings from "@/hooks/useSettings";

import onUpdateSettings from "@/server-actions/update-settings";

function Form() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings.details");
  const { user: sessionUser } = useAuthSession();
  const email = sessionUser?.email;
  const { values } = useSettings();
  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitted, isSubmitSuccessful },
  } = useForm();

  useEffect(() => {
    queryClient.refetchQueries({
      queryKey: ["user", email],
    });
  }, [queryClient, email]);

  useEffect(() => {
    if (isSubmitting) {
      Toast({
        message: t("updating"),
        type: "loading",
      });
    }

    if (isSubmitted) {
      Toast({
        message: t("updated"),
        type: "success",
      });
    }

    if (isSubmitSuccessful) {
      //* Optimistic update
      queryClient.cancelQueries({ queryKey: ["user", email] }).then(() => {
        const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
          "user",
          email,
        ]);
        queryClient.setQueryData(["user", email], {
          ...previousUserData,
          user: {
            ...previousUserData?.user,
            name: values.account.name,
            email: values.account.email,

            profile: {
              ...previousUserData?.user?.profile,
              city: values.personal.city,
              country: values.personal.country,
            },
          },
        });

        return { previousUserData };
      });

      queryClient.invalidateQueries({
        queryKey: ["user", email],
      });
    }
  }, [
    t,
    isSubmitted,
    isSubmitting,
    isSubmitSuccessful,
    queryClient,
    email,
    values.account.name,
    values.account.email,
    values.personal.city,
    values.personal.country,
  ]);

  function onSubmitForm() {
    onUpdateSettings(values);
  }

  return (
    <FormBase
      classes="flex w-full flex-col gap-4"
      onSubmit={handleSubmit(onSubmitForm)}
      id="settings"
    >
      <Section title={t("title")}>
        <AccountInputs />
        <PersonalInputs />
      </Section>
    </FormBase>
  );
}

export default Form;
