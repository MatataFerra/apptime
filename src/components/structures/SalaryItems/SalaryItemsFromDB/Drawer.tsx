"use client";

import type { Tax } from "@prisma/client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";
import Skeleton from "@/components/ui/Skeleton";

import { TypeOfSalaryItem } from "@/store/useTaxOrContributionStore";

const DrawerClose = dynamic(() => import("@/components/ui/Drawer").then((mod) => mod.DrawerClose), {
  ssr: false,
});

const DrawerFooter = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerFooter),
  {
    ssr: false,
  }
);

const DrawerTrigger = dynamic(
  () => import("@/components/ui/Drawer").then((mod) => mod.DrawerTrigger),
  {
    ssr: false,
  }
);

const SalaryItemsFromDB = dynamic(
  () => import("@/components/structures/SalaryItems/SalaryItemsFromDB/SalaryItemsFromDB"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-32 w-full" />,
  }
);

type Props = {
  type: TypeOfSalaryItem;
  shouldScaleBackground?: boolean;
  drawerStateHandler: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
  add: (tax: Omit<Tax, "id">) => void;
};

export interface Observer {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function DrawerSalaryItemsFromDB({
  add,
  type,
  drawerStateHandler,
  shouldScaleBackground = false,
}: Props) {
  return (
    <Drawer
      open={drawerStateHandler.isOpen}
      shouldScaleBackground={shouldScaleBackground}
      onOpenChange={(value) => {
        drawerStateHandler.setIsOpen(value);
      }}
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="white"
          size="md"
          classes={`w-full animate-pulse border-none bg-linear-to-tr from-sky-300/30 to-blue-400/40 font-medium transition-all duration-700 repeat-[3] hover:from-sky-300/40 hover:to-blue-400/50 active:shadow-button-inner`}
        >
          Click to use previous
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Use the previous ones</DrawerTitle>
          <DrawerDescription>
            <VisuallyHidden.Root>
              Select from your previous taxes or contributions to add them to your current tax or
              contribution element.
            </VisuallyHidden.Root>
          </DrawerDescription>
        </DrawerHeader>
        <article className="mx-auto my-0 h-full w-11/12 border border-slate-500/20 p-4 shadow-md">
          <SalaryItemsFromDB add={add} type={type} />
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

export default DrawerSalaryItemsFromDB;
