"use client";

import type { ChangeEvent } from "react";

import type { Tax } from "@prisma/client";

import AccordionFaq from "@/components/structures/Taxes/AccordionFaq";
import InputTax from "@/components/structures/Taxes/InputTax";
import Table from "@/components/structures/Taxes/Table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

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
  return (
    <Accordion type="single" collapsible className="w-full rounded-lg p-2 shadow-md ring-2">
      <AccordionItem value="one">
        <AccordionTrigger className="py-1 text-base font-bold hover:no-underline">
          <Stack as="div">Add a tax</Stack>
        </AccordionTrigger>
        <AccordionContent>
          <Stack orientation="vertical" alignItems="center">
            <InputTax addTax={addTax} />
            <Table data={taxes} emptyContent={emptyTableText} removeTax={removeTax} taxes={taxes} />
          </Stack>
          {taxes.length > 0 && (
            <Button
              type="button"
              variant="outlined"
              size="md"
              classes="mx-auto my-4 flex w-[95%] animate-fade-in justify-center ring-2 ring-red-500/80"
              onClick={() => {
                setSaveTaxes(false);
                clearTaxes();
              }}
            >
              Clear all
            </Button>
          )}
          {taxes.length > 0 && (
            <Stack alignItems="center" classes="mb-4 mt-8 w-full animate-fade-in transition-all">
              <Text as="label" htmlFor="save-taxes">
                save taxes for future use
              </Text>
              <input
                className="size-4"
                type="checkbox"
                id="save-taxes"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSaveTaxes(Boolean(e.target.value))
                }
              />
            </Stack>
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
