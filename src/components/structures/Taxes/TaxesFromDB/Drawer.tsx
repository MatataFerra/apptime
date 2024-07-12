"use client";

import type { Tax } from "@prisma/client";
import { create } from "zustand";

import TaxesFromDB from "@/components/structures/Taxes/TaxesFromDB/TaxesFromDB";
import Button from "@/components/ui/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

interface Observer {
  isOpen: boolean;
  openDrawer: () => void;
  close: () => void;
}

export const observer = create<Observer>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

function DrawerFromDB({ addTax }: Props) {
  const { openDrawer, close } = observer((state) => state);
  return (
    <Drawer
      shouldScaleBackground={false}
      onOpenChange={(open) => {
        if (open) {
          openDrawer();
        } else {
          close();
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="white"
          size="md"
          classes={`w-full animate-pulse border-none bg-gradient-to-tr from-sky-300/30 to-blue-400/40 font-medium transition-all duration-700 repeat-[3] hover:from-sky-300/40 hover:to-blue-400/50 active:shadow-button-inner`}
        >
          Click to use previous taxes
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Use your previous taxes</DrawerTitle>
        </DrawerHeader>
        <article className="mx-auto my-0 h-full w-11/12 border border-slate-500/20 p-4 shadow-md">
          <TaxesFromDB addTax={addTax} />
        </article>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="black" size="md" classes="w-full text-base">
              Save & close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerFromDB;
