import isEmpty from "lodash/isEmpty";

import SalaryElement from "@/components/structures/SalaryItems/SalaryElement";

import type {
  ContributionElement,
  TaxElement as TaxElementType,
  TypeOfSalaryItem,
} from "@/store/useTaxOrContributionStore";

type Props = {
  data: TaxElementType[] | ContributionElement[];
  type: TypeOfSalaryItem;
  remove: (element: string) => void;
};

function TableSalary({ data, remove, type }: Props) {
  return (
    <div role="table" className="w-full transition-all">
      <article>
        <div className="rounded-md border border-border-strong/20 p-2 shadow-md">
          <h3 className="mb-2 animate-pulse">
            {!isEmpty(data)
              ? `Check out your ${type === "taxes" ? "taxes" : "contributions"}:`
              : `Waiting for ${type === "taxes" ? "taxes" : "contributions"}...`}
          </h3>
          <ol className="grid h-16 grid-cols-2 overflow-y-scroll marker:text-xs sm:grid-cols-3">
            {data?.map((tax, index) => (
              <li key={tax.name} role="row">
                <SalaryElement
                  salariesItems={data}
                  salaryItem={tax}
                  index={index}
                  remove={remove}
                  type={type}
                />
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}

export default TableSalary;
