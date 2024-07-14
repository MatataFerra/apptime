import { useCallback } from "react";

import TaxPopover from "@/components/structures/Taxes/Popover";
import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useTax from "@/hooks/useTax";

import { TaxElement as TaxElementType } from "@/store/useTaxStore";

function TaxElement({
  tax,
  index,
  removeTax,
  taxes,
}: {
  taxes: TaxElementType[];
  tax: TaxElementType;
  index: number;
  removeTax: (tax: string) => void;
}) {
  const { data: dbTaxes } = useTax();
  const isRepeated = useCallback(
    (taxName: string) => {
      const inDb = dbTaxes?.tax?.find((tax) => tax.name === taxName);
      const inLocal = taxes?.find((tax) => tax.name === inDb?.name);

      // if tax is in local and into db with fromDb in true
      if (inLocal?.fromDb && inDb?.name === inLocal?.name) return false;

      // the tax is in local and not into db and is unique
      if (!inDb) return false;

      // the tax is in local, not into db but the name was found in db
      if (inDb?.name === inLocal?.name) return true;

      return !inLocal?.fromDb || typeof inLocal?.fromDb === "undefined";
    },
    [dbTaxes?.tax, taxes]
  );

  const foundRepeated = useCallback(
    (taxName: string) => {
      return dbTaxes?.tax?.find((tax) => tax.name === taxName);
    },
    [dbTaxes?.tax]
  );

  return (
    <div className="flex flex-row items-center">
      {isRepeated(tax.name) ? (
        <>
          <TaxPopover
            content={
              <p className="flex flex-col text-xs">
                You already have used this tax, please choose other name{" "}
                <span className="line-clamp-1 font-bold text-sky-800">
                  {`Your tax add: ${tax.name}: ${tax?.value}% 
                    ${tax.description ? `(${tax.description})` : ""}
                  `}
                </span>
                <span className="line-clamp-1 font-bold text-slate-600">
                  {`Saved tax: ${foundRepeated(tax.name)?.name}: ${foundRepeated(tax.name)?.value}% 
                    ${foundRepeated(tax.name)?.description ? `(${foundRepeated(tax.name)?.description})` : ""}
                  `}
                </span>
              </p>
            }
          >
            <p
              className={cn(
                "line-clamp-1 text-xs",
                isRepeated(tax.name) ? "animate-shake text-red-500 repeat-1" : ""
              )}
            >
              <span className="text-xs text-slate-400">{index + 1}. </span>
              {tax.name}: {tax.value}% {tax.description ? `(${tax.description})` : ""}
            </p>
          </TaxPopover>
          <Button
            size="xs"
            variant="outlined"
            classes="text-red-500 hover:underline"
            onClick={() => removeTax(tax.name)}
          >
            delete
          </Button>
        </>
      ) : (
        <>
          <p className={cn("text-xs", isRepeated(tax.name) ? "text-red-500" : "")}>
            <span className="text-xs text-slate-400">{index + 1}. </span>
            {tax.name}: {tax.value}% {tax.description ? `(${tax.description})` : ""}
          </p>
          <Button
            size="xs"
            variant="outlined"
            classes="text-red-500 hover:underline"
            onClick={() => removeTax(tax.name)}
          >
            delete
          </Button>
        </>
      )}
    </div>
  );
}

export default TaxElement;
