"use client";

import { useCallback, useEffect, useState } from "react";

import type { Contribution, Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Buttons from "@/components/structures/SalaryItems/SalaryItemsFromDB/Buttons";
import Searcher, {
  searchStore,
} from "@/components/structures/SalaryItems/SalaryItemsFromDB/Searcher";
import Title from "@/components/structures/SalaryItems/SalaryItemsFromDB/Title";
import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import useSalaryItems from "@/hooks/useSalaryItems";

import type { ContributionOrTax, TypeOfSalaryItem } from "@/store/useTaxOrContributionStore";

export const ITEMS_PER_PAGE = 4;

type Props = {
  add: (element: ContributionOrTax) => void;
  type: TypeOfSalaryItem;
};

function SalaryItemsFromDB({ add, type }: Props) {
  const [userHasAddedSalaryItem, setUserHasAddedSalaryItem] = useState(false);
  const { search } = searchStore((state) => state);
  const [salaryItems, setSalaryItems] = useState<Tax[] | Contribution[]>([]);
  const [page, setPage] = useState(1);
  const { data: dataSalary } = useSalaryItems();

  useEffect(() => {
    if (!dataSalary) return;
    if (search === "") {
      setSalaryItems(dataSalary.salaryItems[type] || []);
    } else {
      const filterTaxes =
        dataSalary.salaryItems[type].filter((tax) => {
          return tax.name.toLowerCase().includes(search.toLowerCase());
        }) || [];
      setSalaryItems(filterTaxes);
    }
  }, [dataSalary, dataSalary?.salaryItems, search, type]);

  const paginateTaxes = useCallback(() => {
    let start = (page - 1) * ITEMS_PER_PAGE;
    let end = page * ITEMS_PER_PAGE;

    if (end >= salaryItems.length) end = salaryItems.length;
    if (start < 0) start = 0;
    if (start >= salaryItems.length) start = 0;

    const taxesPaginated = salaryItems?.slice(start, end) || [];

    return taxesPaginated;
  }, [page, salaryItems]);

  return (
    <>
      {!isEmpty(salaryItems) ? (
        <>
          <Stack alignItems="center">
            <Title />
            <Searcher />
          </Stack>
          <ul className="mt-2 grid min-h-20 grid-cols-2 gap-4">
            {paginateTaxes()?.map((salaryItem) => {
              const { id, ...rest } = salaryItem;
              return (
                <li key={salaryItem.name} role="row">
                  <div className="grid grid-cols-2 items-center gap-1">
                    <p className="line-clamp-1 text-xs">
                      {salaryItem.name}: {salaryItem.value}%
                    </p>
                    <Button
                      size="xs"
                      variant="outlined"
                      classes="border border-accent transition-colors active:bg-accent/20"
                      onClick={() => {
                        if (userHasAddedSalaryItem) return;
                        setUserHasAddedSalaryItem(true);

                        setTimeout(() => {
                          setUserHasAddedSalaryItem(false);
                        }, 750);

                        add({ ...rest, fromDb: true });
                      }}
                    >
                      add
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Buttons
            page={page}
            setPage={setPage}
            maxPages={Math.ceil(salaryItems.length / ITEMS_PER_PAGE)}
            salaryElements={salaryItems}
            userNotification={
              <>
                {userHasAddedSalaryItem ? (
                  <div className="absolute left-0 animate-fade-in rounded-md bg-primary/70 px-2 py-1 text-center text-white transition-all">
                    Added
                  </div>
                ) : null}
              </>
            }
          />
        </>
      ) : (
        <Stack classes="min-h-36 w-full" justifyContent="center" alignItems="center">
          No items founded
        </Stack>
      )}
    </>
  );
}

export default SalaryItemsFromDB;
