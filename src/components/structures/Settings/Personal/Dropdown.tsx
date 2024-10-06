import DropdownFlagSearchable from "@/components/structures/share/DropdownFlagSearchable";

import { COUNTRIES } from "@/utils/constants/countries";
import getCountryData from "@/utils/helpers/getCountryData";

type Props = {
  staleTitle?: string;
  emptyTitle?: string;
  searchingTitle?: string;
  setSelected?: (value: string) => void;
};

function Dropdown({ ...props }: Props) {
  const parseData = COUNTRIES.map((country) => ({
    label: `${getCountryData(country.name).flag} ${country.name}`,
    value: country.name,
    id: country.id,
  }));
  return <DropdownFlagSearchable data={parseData} {...props} />;
}

export default Dropdown;
