"use client";

import { type PropsWithChildren } from "react";

import dynamic from "next/dynamic";
import { create } from "zustand";

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
import Skeleton from "@/components/ui/Skeleton";

import { useTrackTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const TaxPicker = dynamic(() => import("@/components/structures/SalaryItems/TaxPicker"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full rounded-xl" />,
});

type Observer = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useTaxDialog = create<Observer>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

/** Taxes for the running shift; they're applied when the shift is finished. */
function TaxDialog({ children }: PropsWithChildren) {
  const { taxesModule } = useTrackTaxesOrContributionsStore();
  const { isOpen, setIsOpen } = useTaxDialog((state) => state);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Taxes for this shift</DialogTitle>
          <DialogDescription>They&apos;re applied when you finish the shift.</DialogDescription>
        </DialogHeader>
        <TaxPicker store={taxesModule} theme="track" bare />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="primary" size="lg" classes="w-full">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxDialog;
