import isEmpty from "lodash/isEmpty";

import TaxElement from "@/components/structures/Taxes/Tax";

import type { TaxElement as TaxElementType } from "@/store/useTaxStore";

type Props = {
  data: TaxElementType[];
  addTax: (tax: TaxElementType) => void;
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
                <TaxElement taxes={data} tax={tax} index={index} removeTax={removeTax} />
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}

export default TableTax;
