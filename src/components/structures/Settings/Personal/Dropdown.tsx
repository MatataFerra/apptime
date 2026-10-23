"use client";

import DropdownFlagSearchable from "@/components/structures/share/DropdownFlagSearchable";

import { COUNTRIES } from "@/utils/constants/countries";
import getCountryData from "@/utils/helpers/getCountryData";
import useRegionName from "@/hooks/useRegionName";

type Props = {
  staleTitle?: string;
  emptyTitle?: string;
  searchingTitle?: string;
  setSelected?: (value: string) => void;
};

function Dropdown({ ...props }: Props) {
  const regionName = useRegionName();
  // The value stays the English name (what is saved); the label is in the app's language.
  const parseData = COUNTRIES.map((country) => ({
    label: `${getCountryData(country.name).flag} ${regionName(country.id, country.name)}`,
    value: country.name,
    id: country.id,
  }));
  return <DropdownFlagSearchable data={parseData} {...props} />;
}

export default Dropdown;
