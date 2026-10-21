"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import Toast from "@/services/Toast";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

import AccordionSettings from "@/components/structures/Settings/Accordion";
import FormBase from "@/components/ui/Form";
import Skeleton from "@/components/ui/Skeleton";

import { useAuthSession } from "@/providers/Session";

import useSettings from "@/hooks/useSettings";

import onUpdateSettings from "@/server-actions/update-settings";

const Account = dynamic(() => import("@/components/modules/Settings/Account"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-full" />,
});

const Personal = dynamic(() => import("@/components/modules/Settings/Personal"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-full" />,
});

function Form() {
  const queryClient = useQueryClient();
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
        message: "Updating settings...",
        type: "loading",
      });
    }

    if (isSubmitted) {
      Toast({
        message: "Settings updated successfully",
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
      <AccordionSettings>
        <Account />
        <Personal />
      </AccordionSettings>
    </FormBase>
  );
}

export default Form;
