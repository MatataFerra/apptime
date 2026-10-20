import type { Contribution, Tax } from "@prisma/client";

import type { SalaryItemInput } from "@/types";

import useSalaryItems from "@/hooks/useSalaryItems";

type HookProps = {
  localTaxes: SalaryItemInput[];
  localContributions: SalaryItemInput[];
};

type Named = { name: string };

function notSavedYet<T extends Named>(local: T[], saved: Named[] | undefined) {
  return local.filter((item) => !saved?.some((s) => s.name === item.name));
}

/**
 * Taxes and contributions picked for this shift that aren't saved yet,
 * so the optimistic update only adds the new ones.
 */
function useGetUniqueSalaryItems({ localTaxes, localContributions }: HookProps) {
  const { data } = useSalaryItems();

  return {
    uniqueTaxes: notSavedYet(localTaxes, data?.salaryItems.taxes),
    uniqueContributions: notSavedYet(localContributions, data?.salaryItems.contributions),
  };
}

export default useGetUniqueSalaryItems;
