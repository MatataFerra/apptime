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
    <ul className="flex flex-col gap-2">
      {shift?.taxes?.map((tax) => {
        const removing = isTaxAdded(tax.id);

        return (
          <li
            key={tax.id}
            className={cn(
              "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2 transition-colors",
              removing ? "border-destructive/40 bg-destructive-soft" : "border-border bg-surface"
            )}
          >
            <span className={cn("flex min-w-0 flex-col", removing && "text-destructive")}>
              <span className={cn("text-sm font-medium", removing && "line-through")}>
                {tax.name} <span className="tabular-nums">{tax.value}%</span>
              </span>
              {tax.description ? (
                <span className="truncate text-xs text-ink-muted">{tax.description}</span>
              ) : null}
            </span>
            {removing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                classes="w-auto"
                onClick={() => {
                  restoreTax(tax.id);
                  Toast({ type: "plain", message: "Tax kept", duration: 1500 });
                }}
              >
                Undo
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                classes="w-auto text-destructive"
                onClick={() => {
                  addTaxToDelete(tax);
                  Toast({
                    type: "plain",
                    message: "Tax will be removed",
                    description: "Save changes to apply it.",
                    duration: 1500,
                  });
                }}
              >
                Remove
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default Taxes;
