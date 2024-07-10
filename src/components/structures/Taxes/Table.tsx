"use client";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import TaxesFromDB from "@/components/structures/Taxes/TaxesFromDB/TaxesFromDB";
import Button from "@/components/ui/Button";

import useDelayed from "@/hooks/useDelayed";

import { useTaxesFromDbStore } from "@/store/useTaxStore";

type Props = {
  data: Omit<Tax, "id">[];
  addTax: (tax: Omit<Tax, "id">) => void;
  removeTax: (tax: string) => void;
};

function TableTax({ data, removeTax, addTax }: Props) {
  const { open, setOpen } = useTaxesFromDbStore((state) => state);
  const delayOpen = useDelayed(open, 750);
  return (
    <div role="table" className="w-full">
      {delayOpen ? (
        <section
          role="region"
          className={`relative min-h-10 rounded-md border border-slate-500/20 p-2 shadow-md ${open ? "animate-fade-up" : "animate-fade-down transition-all"}`}
        >
          <Button
            type="button"
            variant="white"
            size="sm"
            classes="absolute right-0 top-0 m-1 size-7 border-none p-1 font-medium active:shadow-button-inner"
            onClick={() => {
              setOpen();
            }}
          >
            {"x"}
          </Button>
          <TaxesFromDB addTax={addTax} />
        </section>
      ) : (
        <Button
          type="button"
          variant="white"
          size="sm"
          classes="mb-4 ml-auto w-fit border-none p-1 font-medium active:shadow-button-inner"
          onClick={() => {
            setOpen();
          }}
        >
          Open found taxes
        </Button>
      )}
      <article>
        {open ? <div role="none" className="my-4 border-t border-stone-600/70" /> : null}

        <div className="rounded-md border border-slate-500/20 p-2 shadow-md">
          <h3 className="mb-2">
            {!isEmpty(data) ? "Check out your taxes:" : "Waiting for taxes..."}
          </h3>
          <ol className="grid h-20 grid-cols-2 overflow-y-scroll marker:text-xs sm:grid-cols-3">
            {data?.map((tax, index) => (
              <li key={tax.name} role="row">
                <div className="flex flex-row items-center">
                  <p className="text-xs">
                    <span className="text-xs text-slate-400">{index + 1}. </span>
                    {tax.name}: {tax.value}%
                  </p>
                  <Button
                    size="xs"
                    variant="outlined"
                    classes="text-red-500 hover:underline"
                    onClick={() => removeTax(tax.name)}
                  >
                    delete
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}

export default TableTax;
