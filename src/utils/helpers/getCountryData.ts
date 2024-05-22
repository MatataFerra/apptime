import { COUNTRIES, Country } from "@/utils/constants/countries";

function getCountryData(country: Country["name"]) {
  if (!country) return { flag: "", countryId: "", country: "" };
  const countryId = COUNTRIES.find((c) => c.name === country)?.id ?? "";
  const flag = [...countryId]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))) // Pass the char argument to String.fromCodePoint()
    ?.reduce((a, b) => `${a}${b}`);
  return {
    flag,
    countryId,
    country,
  };
}

export default getCountryData;
