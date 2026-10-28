"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

import { ChoicePopover } from "@/components/ui/Choice";

import { COUNTRIES } from "@/utils/constants/countries";
import getCountryData from "@/utils/helpers/getCountryData";
import useRegionName from "@/hooks/useRegionName";

type Props = {
  /** For the row's `<label htmlFor>`. */
  id?: string;
  label: string;
  /** The English name, as saved. */
  value: string | null | undefined;
  placeholder: string;
  searchPlaceholder: string;
  onChange: (country: string) => void;
};

/**
 * Country, in the app's floating picker: flag and name in the app's
 * language, A to Z, with a search box that also matches the English name.
 * The value stays the English name, which is what is saved.
 */
function CountrySelect({ id, label, value, placeholder, searchPlaceholder, onChange }: Props) {
  const regionName = useRegionName();
  const locale = useLocale();

  const options = useMemo(
    () =>
      COUNTRIES.map((country) => ({
        value: country.name,
        name: regionName(country.id, country.name),
        flag: getCountryData(country.name).flag,
      }))
        .sort((a, b) => a.name.localeCompare(b.name, locale))
        .map(({ value, name, flag }) => ({
          value,
          label: `${flag} ${name}`,
          keywords: value,
        })),
    [regionName, locale]
  );

  function display(country: string) {
    const { flag, countryId } = getCountryData(country);
    return `${flag} ${regionName(countryId, country)}`;
  }

  return (
    <ChoicePopover
      id={id}
      variant="field"
      label={label}
      value={value || undefined}
      display={display}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      options={options}
      onChange={onChange}
    />
  );
}

export default CountrySelect;
