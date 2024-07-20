import type { PropsWithChildren } from "react";

import dynamic from "next/dynamic";
import { create } from "zustand";

import Toast from "@/services/Toast";

import {
  type Observer,
  useDrawerTaxesFromDB,
} from "@/components/structures/Taxes/TaxesFromDB/Drawer";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";

import { useTrackTaxesStore } from "@/store/useTaxStore";

const Dialog = dynamic(() => import("@/components/ui/Dialog").then((mod) => mod.Dialog), {
  ssr: false,
});

const DialogClose = dynamic(() => import("@/components/ui/Dialog").then((mod) => mod.DialogClose), {
  ssr: false,
});

const DialogContent = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogContent),
  {
    ssr: false,
  }
);

const DialogDescription = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogDescription),
  {
    ssr: false,
  }
);

const DialogFooter = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogFooter),
  {
    ssr: false,
  }
);

const DialogHeader = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogHeader),
  {
    ssr: false,
  }
);

const DialogTitle = dynamic(() => import("@/components/ui/Dialog").then((mod) => mod.DialogTitle), {
  ssr: false,
});

const DialogTrigger = dynamic(
  () => import("@/components/ui/Dialog").then((mod) => mod.DialogTrigger),
  {
    ssr: false,
  }
);

const DrawerFromDB = dynamic(() => import("@/components/structures/Taxes/TaxesFromDB/Drawer"), {
  ssr: false,
});

const InputTax = dynamic(() => import("@/components/structures/Taxes/InputTax"), {
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
});

const TableTax = dynamic(() => import("@/components/structures/Taxes/Table"), {
  ssr: false,
  loading: () => <Skeleton classes="h-60 w-full" />,
});

export const useTaxDialog = create<Observer>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

type Props = {};

function TaxDialog({ children }: PropsWithChildren<Props>) {
  const { taxes, addTax, removeTax } = useTrackTaxesStore();
  const { isOpen: isDrawerTaxesOpen } = useDrawerTaxesFromDB((state) => state);
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
            <InputTax addTax={addTax} />
          </div>
          <TableTax data={taxes} addTax={addTax} removeTax={removeTax} />
        </div>
        <DialogFooter className="my-4 grid grid-cols-[1fr_auto] gap-2">
          <DrawerFromDB addTax={addTax} />
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
              {taxes.length === 0 ? "Close" : "Save taxes"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxDialog;
