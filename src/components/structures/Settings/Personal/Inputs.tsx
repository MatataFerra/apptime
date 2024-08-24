"use client";

import AccordionItemSettings from "@/components/structures/Settings/AccordionItem";
import Input from "@/components/structures/Settings/Input";
import Dropdown from "@/components/structures/Settings/Personal/Dropdown";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";
import getCountryData from "@/utils/helpers/getCountryData";
import useSettings from "@/hooks/useSettings";

function Inputs() {
  const { setValue, values, isLoading } = useSettings();

  function onChangeInputs(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, id } = e.target;

    setValue({
      personal: {
        ...values.personal,
        [id]: value,
      },
    });
  }

  return (
    <AccordionItemSettings value="personal" trigger="Personal Details">
      <Input
        name={SETTINGS_FIELDS.personal.city.toLowerCase()}
        id={SETTINGS_FIELDS.personal.city.toLowerCase()}
        label={SETTINGS_FIELDS.personal.city}
        description="Your city"
        variant="outlined"
        value={values.personal.city}
        isLoading={isLoading}
        onChange={onChangeInputs}
      />
      <Dropdown
        staleTitle={
          values.personal.country
            ? `${getCountryData(values.personal.country).flag} ${values.personal.country}`
            : "Select your country"
        }
        searchingTitle="Found your country"
        setSelected={(value) =>
          setValue({
            personal: {
              ...values.personal,
              country: value,
            },
          })
        }
      />
    </AccordionItemSettings>
  );
}

export default Inputs;
