import { type PropsWithChildren, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import DrawerFromDB, { observer } from "@/components/structures/Taxes/TaxesFromDB/Drawer";
import Button from "@/components/ui/Button";
import {
  Drawer as DrawerContainer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  taxes: Omit<Tax, "id">[];
  addTax: (tax: Omit<Tax, "id">) => void;
  setSaveTaxes: (value: boolean) => void;
  clearTaxes: () => void;
  removeTax: (tax: string) => void;
};

function Drawer({ taxes, addTax, removeTax, children }: PropsWithChildren<Props>) {
  const [addMoreTaxes, setAddMoreTaxes] = useState(false);
  const { isOpen } = observer((state) => state);

  return (
    <DrawerContainer shouldScaleBackground>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerPortal>
        <DrawerContent className={cn(isOpen ? "!scale-90 !transform" : "scale-100 transform")}>
          <DrawerHeader className="text-left">
            <DrawerTitle>Taxes</DrawerTitle>
            <DrawerDescription>Add new taxes or use previous ones</DrawerDescription>
          </DrawerHeader>
          {addMoreTaxes || !isEmpty(taxes) ? (
            <>
              <Stack
                as="article"
                orientation="vertical"
                classes="w-full animate-fade-in p-4 transition-all repeat-1"
              >
                <Text as="h2" classes="text-sm font-medium">
                  Add new taxes
                </Text>
                <InputTax addTax={addTax} />
              </Stack>
              <Stack orientation="vertical" classes="w-full p-4">
                <TableTax addTax={addTax} removeTax={removeTax} data={taxes} />
              </Stack>
            </>
          ) : (
            <Stack as="div">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                classes="m-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300 bg-gradient-to-tl from-slate-200 via-slate-200/60 to-slate-300 p-4"
                onClick={() => setAddMoreTaxes(true)}
              >
                Click to add more taxes
              </Button>
            </Stack>
          )}
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="black" size="md" classes="w-auto text-base">
                Save & close
              </Button>
            </DrawerClose>
            <DrawerFromDB addTax={addTax} />
          </DrawerFooter>
        </DrawerContent>
      </DrawerPortal>
    </DrawerContainer>
  );
}

export default Drawer;
