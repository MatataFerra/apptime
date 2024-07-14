"use client";

import { useCallback, useEffect, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Buttons from "@/components/structures/Taxes/TaxesFromDB/Buttons";
import Searcher, { searchStore } from "@/components/structures/Taxes/TaxesFromDB/Searcher";
import Title from "@/components/structures/Taxes/TaxesFromDB/Title";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import useTax from "@/hooks/useTax";

import type { TaxElement } from "@/store/useTaxStore";

export const TAXES_PER_PAGE = 4;

type Props = {
  addTax: (tax: TaxElement) => void;
};

function TaxesFromDB({ addTax }: Props) {
  const [userHasAddedTax, setUserHasAddedTax] = useState(false);
  const { search } = searchStore((state) => state);
  const { data: dbTaxes } = useTax();
  const [taxes, setTaxes] = useState<Tax[]>(dbTaxes?.tax || []);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (search === "") {
      setTaxes(dbTaxes?.tax || []);
    } else {
      const filterTaxes =
        dbTaxes?.tax.filter((tax) => {
          return tax.name.toLowerCase().includes(search.toLowerCase());
        }) || [];
      setTaxes(filterTaxes);
    }
  }, [dbTaxes?.tax, search]);

  const paginateTaxes = useCallback(() => {
    let start = (page - 1) * TAXES_PER_PAGE;
    let end = page * TAXES_PER_PAGE;

    if (end >= taxes.length) end = taxes.length;
    if (start < 0) start = 0;
    if (start >= taxes.length) start = 0;

    const taxesPaginated = taxes?.slice(start, end) || [];

    return taxesPaginated;
  }, [page, taxes]);

  return (
    <>
      {!isEmpty(dbTaxes?.tax) ? (
        <>
          <Stack alignItems="center">
            <Title />
            <Searcher />
          </Stack>
          <ul className="mt-2 grid min-h-20 grid-cols-2 gap-4">
            {paginateTaxes()?.map((tax) => {
              const { id, ...rest } = tax;
              return (
                <li key={tax.name} role="row">
                  <div className="grid grid-cols-2 items-center gap-1">
                    <p className="line-clamp-1 text-xs">
                      {tax.name}: {tax.value}%
                    </p>
                    <Button
                      size="xs"
                      variant="outlined"
                      classes="border border-green-300 transition-colors active:bg-green-400/20"
                      onClick={() => {
                        if (userHasAddedTax) return;
                        setUserHasAddedTax(true);

                        setTimeout(() => {
                          setUserHasAddedTax(false);
                        }, 750);

                        addTax({ ...rest, fromDb: true });
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
            maxPages={Math.ceil(taxes.length / TAXES_PER_PAGE)}
            taxes={taxes}
            userNotification={
              <>
                {userHasAddedTax ? (
                  <div className="absolute left-0 animate-fade-in rounded-md bg-slate-800/70 px-2 py-1 text-center text-white transition-all">
                    Added
                  </div>
                ) : null}
              </>
            }
          />
        </>
      ) : (
        <Skeleton classes="min-h-36 w-full" />
      )}
    </>
  );
}

export default TaxesFromDB;
