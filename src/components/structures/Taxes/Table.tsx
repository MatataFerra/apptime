"use client";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Button from "@/components/ui/Button";

type Props = {
  data: Omit<Tax, "id">[];
  addTax: (tax: Omit<Tax, "id">) => void;
  removeTax: (tax: string) => void;
};

function TableTax({ data, removeTax }: Props) {
  return (
    <div role="table" className="w-full transition-all">
      <article>
        <div className="rounded-md border border-slate-500/20 p-2 shadow-md">
          <h3 className="mb-2">
            {!isEmpty(data) ? "Check out your taxes:" : "Waiting for taxes..."}
          </h3>
          <ol className="grid h-16 grid-cols-2 overflow-y-scroll marker:text-xs sm:grid-cols-3">
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
