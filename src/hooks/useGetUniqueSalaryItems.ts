import { useEffect, useState } from "react";

import type { Contribution, Tax } from "@prisma/client";
import isEqual from "lodash/isEqual";

import useSalaryItems from "@/hooks/useSalaryItems";

type HookProps = {
  localTaxes: Omit<Tax, "id">[];
  localContributions: Omit<Contribution, "id">[];
};

/**
 * @description Custom hook to get the saved taxes.
 * It maps the user and the type of shift and returns the saved taxes
 */
function useGetUniqueSalaryItems({ localTaxes, localContributions }: HookProps) {
  const { data } = useSalaryItems();
  const [savedTaxesFromDB, setSavedTaxesFromDB] = useState<Omit<Tax, "id">[]>();
  const [savedContributionsFromDB, setSavedContributionsFromDB] =
    useState<Omit<Contribution, "id">[]>();

  useEffect(() => {
    if (localTaxes.length > 0) {
      const taxesAlreadyInDB = data?.salaryItems.taxes?.filter((tax) =>
        localTaxes.some((newTax) => {
          return isEqual(newTax.name, tax.name);
        })
      );

      const uniqueTaxes = localTaxes.filter(
        (tax) => !taxesAlreadyInDB?.some((filterTax) => isEqual(filterTax.name, tax.name))
      );
      setSavedTaxesFromDB(uniqueTaxes);
    }
  }, [data?.salaryItems.taxes, localTaxes]);

  useEffect(() => {
    if (localContributions.length > 0) {
      const taxesAlreadyInDB = data?.salaryItems.contributions?.filter((tax) =>
        localContributions.some((newTax) => {
          return isEqual(newTax.name, tax.name);
        })
      );

      const uniqueContributions = localContributions.filter(
        (tax) => !taxesAlreadyInDB?.some((filterTax) => isEqual(filterTax.name, tax.name))
      );
      setSavedContributionsFromDB(uniqueContributions);
    }
  }, [data?.salaryItems.contributions, localContributions]);

  return { uniqueTaxes: savedTaxesFromDB, uniqueContributions: savedContributionsFromDB };
}

export default useGetUniqueSalaryItems;
