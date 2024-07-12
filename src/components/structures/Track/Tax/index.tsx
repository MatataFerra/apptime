import type { PropsWithChildren } from "react";

import Toast from "@/services/Toast";

import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import Legacy_TaxesFromDB from "@/components/structures/Taxes/TaxesFromDB/legacy_TaxesFromDB";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { useTrackTaxesStore } from "@/store/useTaxStore";

type Props = {};

function TaxDialog({ children }: PropsWithChildren<Props>) {
  const { taxes, addTax, removeTax } = useTrackTaxesStore();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-96 overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Add taxes to your shift</DialogTitle>
          <DialogDescription>Select between your previous taxes or add new ones</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <Legacy_TaxesFromDB addTax={addTax} />
          <div className="space-y-2">
            <p>Add new tax</p>
            <InputTax addTax={addTax} />
          </div>
          <TableTax data={taxes} addTax={addTax} removeTax={removeTax} />
        </div>
        <DialogFooter className="my-4 items-end">
          <DialogClose asChild>
            <Button
              variant={taxes.length === 0 ? "black" : "gradient_secondary"}
              size="md"
              onClick={() => {
                if (taxes.length === 0) {
                  Toast({
                    message: "No taxes added",
                    type: "plain",
                    duration: 2000,
                  });

                  return;
                }

                Toast({
                  message: "Taxes saved",
                  type: "plain",
                  description: "Your taxes have been saved to the shift.",
                  duration: 2000,
                });
              }}
            >
              {taxes.length === 0 ? "Close" : "Save taxes"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxDialog;
