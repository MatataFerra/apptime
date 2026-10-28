"use client";

import { useTranslations } from "next-intl";

import Dropdown from "@/components/structures/Settings/Personal/Dropdown";
import { FIELD, Row } from "@/components/structures/Settings/Preferences/Section";
import Skeleton from "@/components/ui/Skeleton";

import getCountryData from "@/utils/helpers/getCountryData";
import useRegionName from "@/hooks/useRegionName";
import useSettings from "@/hooks/useSettings";

/** City and country, saved with "Save details". */
function Inputs() {
  const { setValue, values, isLoading } = useSettings();
  const t = useTranslations("settings.details");
  const regionName = useRegionName();
  const country = values.personal.country;

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
      <Row label={t("country")} stacked>
        {isLoading ? (
          <Skeleton classes="h-11 w-full rounded-xl" />
        ) : (
          <Dropdown
            triggerClassName={FIELD}
            staleTitle={
              country
                ? `${getCountryData(country).flag} ${regionName(
                    getCountryData(country).countryId,
                    country
                  )}`
                : t("select_country")
            }
            searchingTitle={t("search_country")}
            emptyTitle={t("no_country")}
            setSelected={(value) => setValue({ personal: { ...values.personal, country: value } })}
          />
        )}
      </Row>
    </>
  );
}

export default Inputs;
