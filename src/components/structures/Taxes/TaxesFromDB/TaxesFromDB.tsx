"use client";

import { useCallback, useMemo, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Buttons from "@/components/structures/Taxes/TaxesFromDB/Buttons";
import Title from "@/components/structures/Taxes/TaxesFromDB/Title";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import useTax from "@/hooks/useTax";

const TAXES_PER_PAGE = 4;

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

function TaxesFromDB({ addTax }: Props) {
  const [userHasAddedTax, setUserHasAddedTax] = useState(false);
  const { data: dbTaxes } = useTax();
  const taxes = useMemo<Tax[]>(() => dbTaxes?.tax || [], [dbTaxes?.tax]);
  const [page, setPage] = useState(1);

  const paginateTaxes = useCallback(() => {
    if (page >= taxes.length) return;
    if (page < 1) return;

    let start = (page - 1) * TAXES_PER_PAGE;
    let end = page * TAXES_PER_PAGE;

    if (end >= taxes.length) end = taxes.length;
    if (start < 0) start = 0;

    if (start >= taxes.length) return;

    const taxesPaginated = taxes?.slice(start, end) || [];

    return taxesPaginated;
  }, [page, taxes]);

  return (
    <>
      {!isEmpty(dbTaxes?.tax) ? (
        <>
          <Title />
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

                        addTax({ ...rest });
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
            maxPages={taxes.length / TAXES_PER_PAGE}
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
