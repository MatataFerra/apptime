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
            isTaxAdded(tax.id) ? "text-destructive/80" : "text-ink"
          )}
        >
          <article className="flex gap-1 text-xs text-balance">
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
                "cursor-pointer border-accent bg-accent-soft text-ink active:bg-green-300 active:shadow-button-inner"
              )}
              onClick={() => {
                restoreTax(tax.id);
                Toast({
                  type: "plain",
                  message: "Tax restored",
                  duration: 1500,
                  classes: "text-ink-muted",
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
                "cursor-pointer border-destructive text-ink active:bg-destructive-soft active:shadow-button-inner"
              )}
              onClick={() => {
                addTaxToDelete(tax);
                Toast({
                  type: "plain",
                  message: "Tax will be deleted",
                  description: "Please press save to delete it",
                  duration: 1500,
                  classes: "text-destructive",
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
