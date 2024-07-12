import type { PropsWithChildren } from "react";

import Toast from "@/services/Toast";

import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import DrawerFromDB, { observer } from "@/components/structures/Taxes/TaxesFromDB/Drawer";
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

import { cn } from "@/utils/helpers/styleMerger";

import { useTrackTaxesStore } from "@/store/useTaxStore";

type Props = {};

function TaxDialog({ children }: PropsWithChildren<Props>) {
  const { taxes, addTax, removeTax } = useTrackTaxesStore();
  const { isOpen } = observer((state) => state);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "h-96 overflow-y-scroll",
          isOpen ? "scale-95 transform" : "scale-100 transform"
        )}
      >
        <DialogHeader>
          <DialogTitle>Add taxes to your shift</DialogTitle>
          <DialogDescription>Select between your previous taxes or add new ones</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-2">
            <p>Add new tax</p>
            <InputTax addTax={addTax} />
          </div>
          <TableTax data={taxes} addTax={addTax} removeTax={removeTax} />
        </div>
        <DialogFooter className="my-4 flex flex-row items-end gap-2">
          <DrawerFromDB addTax={addTax} />
          <DialogClose asChild>
            <Button
              variant={taxes.length === 0 ? "danger" : "gradient_secondary"}
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
