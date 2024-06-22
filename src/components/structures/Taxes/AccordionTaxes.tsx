"use client";

import { type ChangeEvent, useState } from "react";

import type { Tax, TaxHourlySaved, TaxProductionSaved } from "@prisma/client";
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
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  taxes: Omit<Tax, "id">[];
  type?: "production" | "hourly";
  taxesFromDB: TaxProductionSaved[] | TaxHourlySaved[];
  emptyTableText: string;
  isLoadingTaxes: boolean;
  addTax: (tax: Omit<Tax, "id">) => void;
  setSaveTaxes: (value: boolean) => void;
  clearTaxes: () => void;
  removeTax: (tax: string) => void;
};

function AccordionTaxes({
  taxes,
  type = "production",
  taxesFromDB,
  emptyTableText,
  isLoadingTaxes,
  setSaveTaxes,
  clearTaxes,
  addTax,
  removeTax,
}: Props) {
  const [addMoreTaxes, setAddMoreTaxes] = useState(false);

  return (
    <Accordion
      type="single"
      defaultValue="one"
      collapsible
      className="w-full rounded-md p-2 shadow-md"
    >
      <AccordionItem value="one">
        <AccordionTrigger className="py-1 text-base font-bold hover:no-underline">
          <Stack as="div">Taxes</Stack>
        </AccordionTrigger>
        <AccordionContent>
          {isLoadingTaxes ? (
            <>
              <Stack orientation="vertical">
                <Stack classes="h-8 w-full animate-pulse rounded-md bg-slate-100/60" />
                <Stack
                  classes="h-24 w-full animate-pulse bg-slate-100/60"
                  justifyContent="center"
                  alignItems="center"
                >
                  Loading taxes...
                </Stack>
              </Stack>
            </>
          ) : !isEmpty(taxesFromDB) ? (
            <TaxesFromDB type={type} taxesFromDB={taxesFromDB} />
          ) : (
            <Stack
              classes="h-20 w-full bg-slate-100/60"
              justifyContent="center"
              alignItems="center"
            >
              No taxes saved
            </Stack>
          )}

          {(addMoreTaxes || !isEmpty(taxes)) && (
            <>
              <Line classes="my-4" color="bg-stone-600/40" />
              <Stack orientation="vertical" alignItems="center" classes="px-4 py-2">
                <InputTax addTax={addTax} />
                <TableTax emptyContent={emptyTableText} removeTax={removeTax} data={taxes} />
              </Stack>
              {!isEmpty(taxes) && (
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  classes="mx-auto my-4 flex w-[95%] animate-fade-in items-center justify-center ring-2 ring-red-500/80"
                  onClick={() => {
                    setAddMoreTaxes(false);
                    setSaveTaxes(false);
                    clearTaxes();
                  }}
                >
                  Clear all
                </Button>
              )}
              {!isEmpty(taxes) && (
                <Stack
                  alignItems="center"
                  classes="mb-4 mt-8 w-full animate-fade-in transition-all"
                >
                  <Text as="label" htmlFor="save-taxes">
                    save taxes for future use
                  </Text>
                  <input
                    className="size-4"
                    type="checkbox"
                    id="save-taxes"
                    name="save-taxes"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSaveTaxes(Boolean(e.target.checked))
                    }
                  />
                </Stack>
              )}
            </>
          )}

          {!addMoreTaxes && (
            <Button
              type="button"
              variant="outlined"
              size="sm"
              classes="mx-auto my-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300 bg-gradient-to-bl from-slate-200 via-stone-300/60 to-gray-400"
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
