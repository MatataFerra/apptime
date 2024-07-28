"use client";

import { useCallback } from "react";

import isEmpty from "lodash/isEmpty";

import Toast from "@/services/Toast";

import type { HourlyType, ProductionType } from "@/types";

import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  shift: HourlyType | ProductionType;
};

function Taxes({ shift }: Props) {
  const { taxesToDelete, addTaxToDelete, restoreTax } = useTaxesHandlerDelete((state) => state);
  const isTaxAdded = useCallback(
    (id: number) => {
      const tax = taxesToDelete.find((t) => t.id === id);

      return !isEmpty(tax);
    },
    [taxesToDelete]
  );

  return (
    <div className="grid grid-cols-1 gap-y-2">
      {shift?.taxes?.map((tax) => (
        <div
          key={tax.id}
          className={cn(
            "flex items-center justify-between gap-x-2 transition-all",
            isTaxAdded(tax.id) ? "text-red-600/80" : "text-gray-800"
          )}
        >
          <article className="flex gap-1 text-balance text-sm">
            <p>
              {tax.name} {tax.value}%
            </p>
            {!!tax.description ? <p className="line-clamp-1">({tax.description})</p> : null}
          </article>
          {isTaxAdded(tax.id) ? (
            <Button
              type="button"
              variant="outlined"
              size="xs"
              classes={cn(
                "border px-2 transition-colors",
                "cursor-pointer border-green-400 bg-green-100 text-gray-900 active:bg-green-300 active:shadow-button-inner"
              )}
              onClick={() => {
                restoreTax(tax.id);
                Toast({
                  type: "plain",
                  message: "Tax restored",
                  duration: 1500,
                  classes: "text-gray-500",
                });
              }}
            >
              restore
            </Button>
          ) : (
            <Button
              type="button"
              variant="outlined"
              size="xs"
              classes={cn(
                "border px-2 transition-colors",
                "cursor-pointer border-red-400 text-gray-900 active:bg-red-200 active:shadow-button-inner"
              )}
              onClick={() => {
                addTaxToDelete(tax);
                Toast({
                  type: "plain",
                  message: "Tax will be deleted",
                  description: "Please press save to delete it",
                  duration: 1500,
                  classes: "text-red-600",
                });
              }}
            >
              delete
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Taxes;
