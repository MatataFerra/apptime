import { type PropsWithChildren, useEffect, useState } from "react";

import isEmpty from "lodash/isEmpty";
import { create } from "zustand";

import Toast from "@/services/Toast";

import InputSalaryItem from "@/components/structures/SalaryItems/InputSalaryItem";
import DrawerSalaryItemsFromDB, {
  type Observer,
} from "@/components/structures/SalaryItems/SalaryItemsFromDB/Drawer";
import TableSalary from "@/components/structures/SalaryItems/Table";
import Button from "@/components/ui/Button";
import {
  Drawer as DrawerContainer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

import type {
  ContributionElement,
  TaxElement,
  TypeOfSalaryItem,
} from "@/store/useTaxOrContributionStore";

type Props = {
  store: {
    type: TypeOfSalaryItem;
    salaryElement: TaxElement[] | ContributionElement[];
    add: (tax: TaxElement | ContributionElement) => void;
    clear: () => void;
    remove: (tax: string) => void;
  };
};

export const useDrawerSalaryItemsFromDB = create<Observer>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

function Drawer({
  store: { salaryElement, add, remove, type },
  children,
}: PropsWithChildren<Props>) {
  const [addMoreElements, setAddMoreElements] = useState(false);
  const { isOpen, setIsOpen } = useDrawerSalaryItemsFromDB((state) => state);

  // useEffect(() => {
  //   console.log("🚀 ~ isOpen:", isOpen);
  // }, [isOpen]);

  return (
    <DrawerContainer shouldScaleBackground={false}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={cn(isOpen ? "!scale-90 !transform" : "scale-100 transform")}>
        <DrawerHeader className="text-left">
          <DrawerTitle className="capitalize">{type}</DrawerTitle>
          <DrawerDescription>Add new {type} or use previous ones</DrawerDescription>
        </DrawerHeader>
        {addMoreElements || !isEmpty(salaryElement) ? (
          <>
            <Stack
              as="article"
              orientation="vertical"
              classes="w-full animate-fade-in p-4 transition-all repeat-1"
            >
              <Text as="h2" classes="text-sm font-medium">
                Add new {type}
              </Text>
              <InputSalaryItem add={add} type={type} />
            </Stack>
            <Stack orientation="vertical" classes="w-full p-4">
              <TableSalary remove={remove} data={salaryElement} type={type} />
            </Stack>
          </>
        ) : (
          <Stack as="div">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              classes="m-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300 bg-gradient-to-tl from-slate-200 via-slate-200/60 to-slate-300 p-4"
              onClick={() => setAddMoreElements(true)}
            >
              Click to add more {type}
            </Button>
          </Stack>
        )}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant="black"
              size="md"
              classes="w-auto text-base"
              onClick={() => {
                if (salaryElement.length > 0) {
                  Toast({
                    message: "Save changes...",
                    type: "plain",
                    duration: 500,
                  });
                }
              }}
            >
              Save & close
            </Button>
          </DrawerClose>
          <DrawerSalaryItemsFromDB
            add={add}
            type={type}
            drawerStateHandler={{
              isOpen,
              setIsOpen,
            }}
          />
        </DrawerFooter>
      </DrawerContent>
    </DrawerContainer>
  );
}

export default Drawer;
