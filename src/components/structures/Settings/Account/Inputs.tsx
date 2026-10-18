"use client";

import AccordionItemSettings from "@/components/structures/Settings/AccordionItem";
import Input from "@/components/structures/Settings/Input";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";
import useSettings from "@/hooks/useSettings";

function Inputs() {
  const { setValue, values, isLoading } = useSettings();
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
    <AccordionItemSettings value="account" trigger="Account">
      <Input
        name={SETTINGS_FIELDS.account.name.toLowerCase()}
        id={SETTINGS_FIELDS.account.name.toLowerCase()}
        label={SETTINGS_FIELDS.account.name}
        description="Your full name"
        variant="outlined"
        value={values.account.name}
        isLoading={isLoading}
        onChange={onChangeInputs}
      />
    </AccordionItemSettings>
  );
}

export default Inputs;
