"use client";

import { useTranslations } from "next-intl";

import AccordionItemSettings from "@/components/structures/Settings/AccordionItem";
import Input from "@/components/structures/Settings/Input";
import Dropdown from "@/components/structures/Settings/Personal/Dropdown";

import getCountryData from "@/utils/helpers/getCountryData";
import useRegionName from "@/hooks/useRegionName";
import useSettings from "@/hooks/useSettings";

function Inputs() {
  const { setValue, values, isLoading } = useSettings();
  const t = useTranslations("settings.details");
  const regionName = useRegionName();

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
    <AccordionItemSettings value="personal" trigger={t("about_you")}>
      <Input
        name="city"
        id="city"
        label={t("city")}
        description={t("city_hint")}
        variant="outlined"
        value={values.personal.city}
        isLoading={isLoading}
        onChange={onChangeInputs}
      />
      <Dropdown
        staleTitle={
          values.personal.country
            ? `${getCountryData(values.personal.country).flag} ${regionName(
                getCountryData(values.personal.country).countryId,
                values.personal.country
              )}`
            : t("select_country")
        }
        searchingTitle={t("search_country")}
        emptyTitle={t("no_country")}
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
