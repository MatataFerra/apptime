import { useEffect, useState } from "react";

import type { Tax } from "@prisma/client";
import isEqual from "lodash/isEqual";

import useTax from "@/hooks/useTax";

type LocalTax = Omit<Tax, "id">;

type HookProps = {
  localTaxes: LocalTax[];
};

/**
 * @description Custom hook to get the saved taxes.
 * It maps the user and the type of shift and returns the saved taxes
 */
function useGetUniqueTaxes({ localTaxes }: HookProps) {
  const { data } = useTax();
  const [savedTaxesFromDB, setSavedTaxesFromDB] = useState<LocalTax[]>();

  useEffect(() => {
    if (localTaxes.length > 0) {
      const taxesAlreadyInDB = data?.tax?.filter((tax) =>
        localTaxes.some((newTax) => {
          return isEqual(newTax.name, tax.name);
        })
      );

      const uniqueTaxes = localTaxes.filter(
        (tax) => !taxesAlreadyInDB?.some((filterTax) => isEqual(filterTax.name, tax.name))
      );
      setSavedTaxesFromDB(uniqueTaxes);
    }
  }, [localTaxes, data?.tax]);

  return savedTaxesFromDB;
}

export default useGetUniqueTaxes;
