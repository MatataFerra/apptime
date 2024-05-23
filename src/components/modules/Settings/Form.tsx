"use client";

import { useForm } from "react-hook-form";

import Account from "@/components/modules/Settings/Account";
import Personal from "@/components/modules/Settings/Personal";
import Shift from "@/components/modules/Settings/Shift";
import FormBase from "@/components/ui/Form";

import onUpdateSettings from "@/server-actions/update-settings";
import { useSettingsStore } from "@/store/useSettingsStore";

function Form() {
  const { values } = useSettingsStore((state) => state);
  const { handleSubmit } = useForm();
  function onSubmitForm() {
    onUpdateSettings(values);
  }
  return (
    <FormBase
      classes="flex w-full flex-col gap-4"
      onSubmit={handleSubmit(onSubmitForm)}
      id="settings"
    >
      <Account />
      <Shift />
      <Personal />
    </FormBase>
  );
}

export default Form;
