import { type PropsWithChildren } from "react";

import dynamic from "next/dynamic";
import { create } from "zustand";

import Toast from "@/services/Toast";

import { type Observer } from "@/components/structures/SalaryItems/SalaryItemsFromDB/Drawer";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";

import { useTrackTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const DialogClose = dynamic(() => import("@/components/ui/Dialog").then((mod) => mod.DialogClose), {
  ssr: false,
});

const DialogFooter = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogFooter),
  {
    ssr: false,
  }
);

const DialogTrigger = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogTrigger),
  {
    ssr: false,
  }
);

const DrawerFromDB = dynamic(
  () => import("@/components/structures/SalaryItems/SalaryItemsFromDB/Drawer"),
  {
    ssr: false,
  }
);

const InputSalaryItem = dynamic(
  () => import("@/components/structures/SalaryItems/InputSalaryItem"),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full flex-col">
        <div className="flex justify-between">
          <Skeleton classes="h-12 w-full" />
          <Skeleton classes="h-12 w-full" />
          <Skeleton classes="h-12 w-full" />
        </div>
        <Skeleton classes="h-12 w-full" />
      </div>
    ),
  }
);

const TableTax = dynamic(() => import("@/components/structures/SalaryItems/Table"), {
  ssr: false,
  loading: () => <Skeleton classes="h-60 w-full" />,
});

export const useTaxDialog = create<Observer>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

export const useDrawerTaxFromDB = create<Observer>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

function TaxDialog({ children }: PropsWithChildren) {
  const {
    taxesModule: { salaryElement: taxes, add: addTax, remove: removeTax },
  } = useTrackTaxesOrContributionsStore();
  const { isOpen: isDrawerTaxesOpen, setIsOpen: setIsDrawerTaxesOpen } = useDrawerTaxFromDB(
    (state) => state
  );
  const { isOpen: isTaxDialogOpen, setIsOpen } = useTaxDialog((state) => state);

  return (
    <Dialog open={isTaxDialogOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "h-96 overflow-y-scroll",
          isDrawerTaxesOpen ? "scale-95 transform" : "scale-100 transform"
        )}
      >
        <DialogHeader>
          <DialogTitle>Add taxes to your shift</DialogTitle>
          <DialogDescription>Select between your previous taxes or add new ones</DialogDescription>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-2">
            <p>Add new tax</p>
            <InputSalaryItem add={addTax} type="taxes" />
          </div>
          <TableTax data={taxes} remove={removeTax} type="taxes" />
        </div>
        <DialogFooter className="my-4 grid grid-cols-[1fr_auto] gap-2">
          <DrawerFromDB
            add={addTax}
            type="taxes"
            drawerStateHandler={{
              isOpen: isDrawerTaxesOpen,
              setIsOpen: setIsDrawerTaxesOpen,
            }}
          />
          <DialogClose asChild>
            <Button
              variant={taxes.length === 0 ? "danger" : "gradient_secondary"}
              size="md"
              classes="w-fit"
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
              {taxes.length === 0 ? "Close" : "Save"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxDialog;
