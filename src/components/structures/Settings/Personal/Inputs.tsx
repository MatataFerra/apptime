"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import CountrySelect from "@/components/structures/Settings/Personal/CountrySelect";
import { FIELD, Row } from "@/components/structures/Settings/Preferences/Section";
import Skeleton from "@/components/ui/Skeleton";

import useSettings from "@/hooks/useSettings";

/** City and country, saved with "Save details". */
function Inputs() {
  const { setValue, values, isLoading } = useSettings();
  const t = useTranslations("settings.details");
  const countryId = useId();

  return (
    <>
      <Row label={t("city")} hint={t("city_hint")} htmlFor="city" stacked>
        {isLoading ? (
          <Skeleton classes="h-11 w-full rounded-xl" />
        ) : (
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            className={FIELD}
            value={values.personal.city}
            onChange={(e) => setValue({ personal: { ...values.personal, city: e.target.value } })}
          />
        )}
      </Row>
      <Row label={t("country")} htmlFor={countryId} stacked>
        {isLoading ? (
          <Skeleton classes="h-11 w-full rounded-xl" />
        ) : (
          <CountrySelect
            id={countryId}
            label={t("country")}
            value={values.personal.country}
            placeholder={t("select_country")}
            searchPlaceholder={t("search_country")}
            onChange={(country) => setValue({ personal: { ...values.personal, country } })}
          />
        )}
      </Row>
    </>
  );
}

export default Inputs;
