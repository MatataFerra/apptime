import DropdownSearchable from "@/components/structures/share/DropdownSearchable";

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
  return <DropdownSearchable data={parseData} {...props} />;
}

export default Dropdown;
