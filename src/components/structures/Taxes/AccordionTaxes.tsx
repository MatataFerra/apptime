"use client";

import { useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import AccordionFaq from "@/components/structures/Taxes/AccordionFaq";
import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import TaxesFromDB from "@/components/structures/Taxes/TaxesFromDB";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
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

function AccordionTaxes({
  taxes,
  emptyTableText,
  setSaveTaxes,
  clearTaxes,
  addTax,
  removeTax,
}: Props) {
  const [addMoreTaxes, setAddMoreTaxes] = useState(false);
  const { isLoading } = useTax();

  return (
    <Accordion type="single" defaultValue="one" collapsible className="w-full rounded-md shadow-md">
      <AccordionItem value="one">
        <AccordionTrigger className="px-2 py-1 text-base font-bold hover:no-underline">
          <Stack as="div">Taxes</Stack>
        </AccordionTrigger>
        <AccordionContent className="space-y-8 p-2">
          {addMoreTaxes && isLoading ? (
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
          )}
          {addMoreTaxes || !isEmpty(taxes) ? (
            <>
              <Stack
                as="article"
                orientation="vertical"
                classes="w-full animate-fade-in transition-all repeat-1"
              >
                <Text as="h2" classes="text-xl font-medium">
                  Add new taxes
                </Text>
                <InputTax addTax={addTax} />
              </Stack>
              <Stack orientation="vertical" classes="w-full">
                <Text as="h3" classes="text-sm font-medium">
                  Check out your taxes
                </Text>
                <TableTax emptyContent={emptyTableText} removeTax={removeTax} data={taxes} />
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
              classes="mx-auto my-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300 bg-gradient-to-tl from-slate-200 via-slate-200/60 to-slate-300"
              onClick={() => setAddMoreTaxes(true)}
            >
              Click to add more taxes
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionFaq />
      </AccordionItem>
    </Accordion>
  );
}

export default AccordionTaxes;
