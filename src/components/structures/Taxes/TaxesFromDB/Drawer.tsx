"use client";

import type { Tax } from "@prisma/client";
import dynamic from "next/dynamic";
import { create } from "zustand";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

const Drawer = dynamic(() => import("@/components/ui/Drawer").then((mod) => mod.Drawer), {
  ssr: false,
});

const DrawerClose = dynamic(() => import("@/components/ui/Drawer").then((mod) => mod.DrawerClose), {
  ssr: false,
});

const DrawerContent = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerContent),
  {
    ssr: false,
  }
);

const DrawerFooter = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerFooter),
  {
    ssr: false,
  }
);

const DrawerHeader = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerHeader),
  {
    ssr: false,
  }
);

const DrawerTitle = dynamic(() => import("@/components/ui/Drawer").then((mod) => mod.DrawerTitle), {
  ssr: false,
});

const DrawerTrigger = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerTrigger),
  {
    ssr: false,
  }
);

const TaxesFromDB = dynamic(() => import("@/components/structures/Taxes/TaxesFromDB/TaxesFromDB"), {
  ssr: false,
  loading: () => <Skeleton classes="h-32 w-full" />,
});

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
  shouldScaleBackground?: boolean;
};

export interface Observer {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useDrawerTaxesFromDB = create<Pick<Observer, "isOpen" | "setIsOpen">>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

function DrawerFromDB({ addTax, shouldScaleBackground = false }: Props) {
  const { isOpen, setIsOpen } = useDrawerTaxesFromDB((state) => state);
  return (
    <Drawer
      open={isOpen}
      shouldScaleBackground={shouldScaleBackground}
      onOpenChange={(value) => {
        setIsOpen(value);
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
