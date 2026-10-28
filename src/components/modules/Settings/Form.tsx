"use client";

import { type FormEvent, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import AccountInputs from "@/components/structures/Settings/Account/Inputs";
import PersonalInputs from "@/components/structures/Settings/Personal/Inputs";
import { Section } from "@/components/structures/Settings/Preferences/Section";
import FormBase from "@/components/ui/Form";

import { useAuthSession } from "@/providers/Session";

import useSettingsChanges from "@/hooks/useSettingsChanges";

/**
 * "Your details": name, city and country. Saved with the rest of Settings by
 * "Save changes" (SaveBar); Enter in a field does the same.
 */
function Form() {
  const queryClient = useQueryClient();
  const t = useTranslations("settings.details");
  const { user: sessionUser } = useAuthSession();
  const email = sessionUser?.email;
  const { dirty, save } = useSettingsChanges();

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["user", email] });
  }, [queryClient, email]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (dirty) save();
  }

  return (
    <FormBase classes="flex w-full flex-col gap-4" onSubmit={onSubmit} id="settings">
      <Section title={t("title")}>
        <AccountInputs />
        <PersonalInputs />
      </Section>
    </FormBase>
  );
}

export default Form;
