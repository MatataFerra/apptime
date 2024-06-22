import { useMemo } from "react";

import type { Tax, TaxHourlySaved, TaxProductionSaved } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Text from "@/components/ui/Text";

type Props = {
  taxes: Omit<Tax, "id">[];
  savedTaxesFromDB: (TaxHourlySaved | TaxProductionSaved)[];
  saveTaxes: boolean;
};

function SaveCases({ taxes, savedTaxesFromDB, saveTaxes }: Props) {
  const cases = useMemo(
    () => ({
      bothEmpty: isEmpty(savedTaxesFromDB) && isEmpty(taxes),
      bothNotEmpty: !isEmpty(savedTaxesFromDB) && !isEmpty(taxes),
      fromDBEmptyAndSavingTaxes: isEmpty(savedTaxesFromDB) && !isEmpty(taxes) && saveTaxes,
      fromDBNotEmptyAndNotSavingTaxes: !isEmpty(savedTaxesFromDB) && !isEmpty(taxes) && !saveTaxes,
      fromDBEmptyAndNotSavingTaxes: isEmpty(savedTaxesFromDB) && !isEmpty(taxes) && !saveTaxes,
      justFromDB: !isEmpty(savedTaxesFromDB) && isEmpty(taxes),
    }),
    [saveTaxes, savedTaxesFromDB, taxes]
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
          {"No taxes added or saved."}
        </Text>
      )}
      {cases.fromDBEmptyAndSavingTaxes && (
        <Text classes="rounded-md bg-gradient-to-tl from-lime-400/60 via-green-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
          {"The taxes will be saved for future use."}
        </Text>
      )}

      {cases.fromDBNotEmptyAndNotSavingTaxes && (
        <Text classes="rounded-md bg-gradient-to-tl from-sky-400/60 via-blue-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
          {"Using tax configuration. Not saving new taxes."}
        </Text>
      )}
      {cases.bothNotEmpty && (
        <Text classes="rounded-md bg-gradient-to-tl from-red-400/60 via-pink-400 to-orange-500/60 px-2 py-1 text-sm font-bold">
          {"You will overwrite the saved taxes with this new configuration."}
        </Text>
      )}

      {cases.fromDBEmptyAndNotSavingTaxes && (
        <Text classes="rounded-md bg-gradient-to-tl from-violet-400/60 via-purple-300 to-fuchsia-500/60 px-2 py-1 text-sm font-bold">
          {"The taxes will not be saved for future use."}
        </Text>
      )}
      {cases.justFromDB && (
        <Text classes="rounded-md bg-gradient-to-tl from-orange-400/60 via-amber-300 to-yellow-500/60 px-2 py-1 text-sm font-bold">
          {"Using tax configuration. Not saving new taxes."}
        </Text>
      )}
    </>
  );
}

export default SaveCases;
