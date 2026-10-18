import { useCallback } from "react";

import TaxPopover from "@/components/structures/SalaryItems/Popover";
import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useSalaryItems from "@/hooks/useSalaryItems";

import type {
  ContributionElement,
  ContributionOrTax,
  TaxElement as TaxElementType,
  TypeOfSalaryItem,
} from "@/store/useTaxOrContributionStore";

function SalaryElement({
  salaryItem,
  index,
  remove,
  salariesItems,
  type,
}: {
  salariesItems: TaxElementType[] | ContributionElement[];
  salaryItem: ContributionOrTax;
  index: number;
  type: TypeOfSalaryItem;
  remove: (salaryItem: string) => void;
}) {
  const { data: dataSalary } = useSalaryItems();
  const isRepeated = useCallback(
    (salaryItemName: string) => {
      const inDb = dataSalary?.salaryItems[type].find((element) => element.name === salaryItemName);
      const inLocal = salariesItems?.find((tax) => tax.name === inDb?.name);

      // if tax is in local and into db with fromDb in true
      if (inLocal?.fromDb && inDb?.name === inLocal?.name) return false;

      // the tax is in local and not into db and is unique
      if (!inDb) return false;

      // the tax is in local, not into db but the name was found in db
      if (inDb?.name === inLocal?.name) return true;

      return !inLocal?.fromDb || typeof inLocal?.fromDb === "undefined";
    },
    [dataSalary?.salaryItems, salariesItems, type]
  );

  const foundRepeated = useCallback(
    (salaryItemName: string) => {
      return dataSalary?.salaryItems[type].find((element) => element.name === salaryItemName);
    },
    [dataSalary?.salaryItems, type]
  );

  return (
    <div className="flex flex-row items-center">
      {isRepeated(salaryItem.name) ? (
        <>
          <TaxPopover
            content={
              <p className="flex flex-col text-xs">
                You already have used this tax, please choose other name{" "}
                <span className="line-clamp-1 font-bold text-sky-800">
                  {`Your tax add: ${salaryItem.name}: ${salaryItem?.value}% 
                    ${salaryItem.description ? `(${salaryItem.description})` : ""}
                  `}
                </span>
                <span className="line-clamp-1 font-bold text-ink-muted">
                  {`Saved tax: ${foundRepeated(salaryItem.name)?.name}: ${foundRepeated(salaryItem.name)?.value}% 
                    ${foundRepeated(salaryItem.name)?.description ? `(${foundRepeated(salaryItem.name)?.description})` : ""}
                  `}
                </span>
              </p>
            }
          >
            <p
              className={cn(
                "line-clamp-1 text-xs",
                isRepeated(salaryItem.name) ? "animate-shake text-destructive repeat-1" : ""
              )}
            >
              <span className="text-xs text-ink-subtle">{index + 1}. </span>
              {salaryItem.name}: {salaryItem.value}%{" "}
              {salaryItem.description ? `(${salaryItem.description})` : ""}
            </p>
          </TaxPopover>
          <Button
            size="xs"
            variant="outlined"
            classes="text-destructive hover:underline"
            onClick={() => remove(salaryItem.name)}
          >
            delete
          </Button>
        </>
      ) : (
        <>
          <p className={cn("text-xs", isRepeated(salaryItem.name) ? "text-destructive" : "")}>
            <span className="text-xs text-ink-subtle">{index + 1}. </span>
            {salaryItem.name}: {salaryItem.value}%{" "}
            {salaryItem.description ? `(${salaryItem.description})` : ""}
          </p>
          <Button
            size="xs"
            variant="outlined"
            classes="text-destructive hover:underline"
            onClick={() => remove(salaryItem.name)}
          >
            delete
          </Button>
        </>
      )}
    </div>
  );
}

export default SalaryElement;
