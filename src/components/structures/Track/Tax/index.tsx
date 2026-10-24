"use client";

import { type PropsWithChildren } from "react";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
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

/** Taxes and contributions for the running shift; applied when it's finished. */
function TaxDialog({ children }: PropsWithChildren) {
  const { taxesModule, contributionsModule } = useTrackTaxesOrContributionsStore();
  const { isOpen, setIsOpen } = useTaxDialog((state) => state);
  const t = useTranslations("track.taxes");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <TaxPicker store={taxesModule} theme="track" bare />
        <hr className="border-border" />
        <TaxPicker kind="contributions" store={contributionsModule} theme="track" bare />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="primary" size="lg" classes="w-full">
              {t("done")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaxDialog;
