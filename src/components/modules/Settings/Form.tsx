"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import Toast from "@/services/Toast";

import AccordionSettings from "@/components/structures/Settings/Accordion";
import FormBase from "@/components/ui/Form";
import Skeleton from "@/components/ui/Skeleton";

import onUpdateSettings from "@/server-actions/update-settings";
import { useSettingsStore } from "@/store/useSettingsStore";

const Account = dynamic(() => import("@/components/modules/Settings/Account"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-full" />,
});

const Personal = dynamic(() => import("@/components/modules/Settings/Personal"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-full" />,
});

const Shift = dynamic(() => import("@/components/modules/Settings/Shift"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-full" />,
});

function Form() {
  const queryClient = useQueryClient();
  const { values } = useSettingsStore((state) => state);
  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitted },
  } = useForm();

  useEffect(() => {
    if (isSubmitting) {
      Toast({
        message: "Updating settings...",
        type: "info",
      });
    }

    if (isSubmitted) {
      Toast({
        message: "Settings updated successfully",
        type: "success",
      });
    }
  }, [isSubmitted, isSubmitting]);

  function onSubmitForm() {
    onUpdateSettings(values).then((data) => {
      if (data) {
        queryClient.invalidateQueries();
        return;
      }

      Toast({
        message: "Error updating settings",
        type: "error",
      });
    });
  }

  return (
    <FormBase
      classes="flex w-full flex-col gap-4"
      onSubmit={handleSubmit(onSubmitForm)}
      id="settings"
    >
      <AccordionSettings>
        <Account />
        <Shift />
        <Personal />
      </AccordionSettings>
    </FormBase>
  );
}

export default Form;
