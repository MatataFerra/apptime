import type { Contribution, Tax } from "@prisma/client";

import type { SalaryItemInput } from "@/types";

import useSalaryItems from "@/hooks/useSalaryItems";

import { sameSalaryItem } from "@/store/useTaxOrContributionStore";

type HookProps = {
  localTaxes: SalaryItemInput[];
  localContributions: SalaryItemInput[];
};

type Item = { name: string; value: number };

function notSavedYet<T extends Item>(local: T[], saved: Item[] | undefined) {
  return local.filter((item) => !saved?.some((s) => sameSalaryItem(s, item)));
}

/**
 * Taxes and contributions picked for this shift that aren't saved yet,
 * so the optimistic update only adds the new ones.
 */
function useGetUniqueSalaryItems({ localTaxes, localContributions }: HookProps) {
  const { data } = useSalaryItems();

  return {
    uniqueTaxes: notSavedYet(localTaxes, data?.salaryItems?.taxes),
    uniqueContributions: notSavedYet(localContributions, data?.salaryItems?.contributions),
  };
}

export default useGetUniqueSalaryItems;
