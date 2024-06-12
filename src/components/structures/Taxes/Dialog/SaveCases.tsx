import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import Text from "@/components/ui/Text";

type Props = {
  taxes: Omit<
    {
      id: number;
      name: string;
      value: number;
      description: string | null;
      hourlyId: number | null;
      productionId: number | null;
    },
    "id"
  >[];
  savedTaxesFromDB: {
    id: number;
    name: string;
    value: number;
    description: string | null;
    taxSavedId: number | null;
  }[];
  saveTaxes: boolean;
};

function SaveCases({ taxes, savedTaxesFromDB, saveTaxes }: Props) {
  const cases = useMemo(
    () => ({
      bothEmpty: isEmpty(savedTaxesFromDB) && !saveTaxes,
      bothNotEmpty: !isEmpty(savedTaxesFromDB) && saveTaxes,
      fromDBEmptyAndSavingTaxes: isEmpty(savedTaxesFromDB) && saveTaxes,
      fromDBNotEmptyAndNotSaving: !isEmpty(savedTaxesFromDB) && !saveTaxes,
    }),
    [saveTaxes, savedTaxesFromDB]
  );

  return (
    <>
      {taxes.map((tax) => (
        <Text key={tax.name.split(" ").join("-")} classes="text-sm">
          {tax.name}: <kbd>{tax.value}%</kbd>
        </Text>
      ))}
      {savedTaxesFromDB.map((tax) => (
        <Text key={tax.name.split(" ").join("-")} classes="text-sm">
          {tax.name}: <kbd>{tax.value}%</kbd>
        </Text>
      ))}
      {cases.bothEmpty && (
        <Text classes="rounded-md bg-gradient-to-tl from-stone-400/60 via-slate-400 to-stone-500/60  px-2 py-1 text-sm font-bold">
          {"Taxes won't be saved."}
        </Text>
      )}
      {cases.fromDBEmptyAndSavingTaxes && (
        <Text classes="rounded-md bg-gradient-to-tl from-lime-400/60 via-green-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
          {"The taxes will be saved for future use."}
        </Text>
      )}

      {cases.fromDBNotEmptyAndNotSaving && (
        <Text classes="rounded-md bg-gradient-to-tl from-sky-400/60 via-blue-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
          {"Using tax configuration. Not saving new taxes."}
        </Text>
      )}
      {cases.bothNotEmpty && (
        <Text classes="rounded-md bg-gradient-to-tl from-red-400/60 via-pink-400 to-orange-500/60 px-2 py-1 text-sm font-bold">
          {"You will overwrite the saved taxes with this new configuration."}
        </Text>
      )}
    </>
  );
}

export default SaveCases;
