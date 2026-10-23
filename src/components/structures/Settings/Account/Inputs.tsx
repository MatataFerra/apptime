"use client";

import { useTranslations } from "next-intl";

import AccordionItemSettings from "@/components/structures/Settings/AccordionItem";
import Input from "@/components/structures/Settings/Input";

import useSettings from "@/hooks/useSettings";

function Inputs() {
  const { setValue, values, isLoading } = useSettings();
  const t = useTranslations("settings.details");
  function onChangeInputs(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, id } = e.target;

    setValue({
      account: {
        ...values.account,
        [id]: value,
      },
    });
  }

  return (
    <AccordionItemSettings value="account" trigger={t("account")}>
      <Input
        name="name"
        id="name"
        label={t("name")}
        description={t("name_hint")}
        variant="outlined"
        value={values.account.name}
        isLoading={isLoading}
        onChange={onChangeInputs}
      />
    </AccordionItemSettings>
  );
}

export default Inputs;
