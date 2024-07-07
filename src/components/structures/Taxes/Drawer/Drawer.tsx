import { type PropsWithChildren, type ReactNode, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import TaxesFromDB from "@/components/structures/Taxes/TaxesFromDB";
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

import useTax from "@/hooks/useTax";

type Props = {
  taxes: Omit<Tax, "id">[];
  emptyTableText: string;
  addTax: (tax: Omit<Tax, "id">) => void;
  setSaveTaxes: (value: boolean) => void;
  clearTaxes: () => void;
  removeTax: (tax: string) => void;
};

function Drawer({
  taxes,
  emptyTableText,
  addTax,
  setSaveTaxes,
  clearTaxes,
  removeTax,
  children,
}: PropsWithChildren<Props>) {
  const [addMoreTaxes, setAddMoreTaxes] = useState(false);
  const { isLoading } = useTax();
  return (
    <DrawerContainer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Taxes</DrawerTitle>
          <DrawerDescription>Add new taxes or use previous ones</DrawerDescription>
        </DrawerHeader>
        {/* {addMoreTaxes && isLoading ? (
          <>
            <Stack orientation="vertical">
              <Stack classes="h-8 w-full animate-pulse rounded-md bg-slate-100/60" />
              <Stack
                classes="h-24 w-full animate-pulse bg-slate-100/60"
                justifyContent="center"
                alignItems="center"
              >
                Trying to retrieve used taxes
              </Stack>
            </Stack>
          </>
        ) : (
          <TaxesFromDB addTax={addTax} />
        )} */}
        {addMoreTaxes || !isEmpty(taxes) ? (
          <>
            <Stack
              as="article"
              orientation="vertical"
              classes="w-full animate-fade-in p-4 transition-all repeat-1"
            >
              <Text as="h2" classes="text-xl font-medium">
                Add new taxes
              </Text>
              <InputTax addTax={addTax} />
            </Stack>
            <Stack orientation="vertical" classes="w-full p-4">
              <Text as="h3" classes="text-sm font-medium">
                Check out your taxes
              </Text>
              <div className="h-10 overflow-y-scroll">
                <TableTax emptyContent={emptyTableText} removeTax={removeTax} data={taxes} />
              </div>
              {!isEmpty(taxes) && (
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  classes="flex w-full animate-fade-in items-center justify-center font-semibold ring-2 ring-red-500/80 active:shadow-button-inner"
                  onClick={() => {
                    setSaveTaxes(false);
                    clearTaxes();
                  }}
                >
                  Clear all added taxes
                </Button>
              )}
            </Stack>
          </>
        ) : (
          <Button
            type="button"
            variant="outlined"
            size="sm"
            classes="mx-auto my-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300 bg-gradient-to-tl from-slate-200 via-slate-200/60 to-slate-300 p-4"
            onClick={() => setAddMoreTaxes(true)}
          >
            Click to add more taxes
          </Button>
        )}
        {/* <TaxesFromDB addTax={addTax} /> */}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="black" size="md" classes="w-auto text-base">
              Save & close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </DrawerContainer>
  );
}

export default Drawer;
