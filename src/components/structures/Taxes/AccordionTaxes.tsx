"use client";

import { type ChangeEvent, useMemo, useState } from "react";

import type { Tax, TaxHourlySaved, TaxProductionSaved } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
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

import useUser from "@/hooks/useUser";

type Props = {
  taxes: Omit<Tax, "id">[];
  type?: "production" | "hourly";
  taxesFromDB: TaxProductionSaved[] | TaxHourlySaved[];
  emptyTableText: string;
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
  setSaveTaxes,
  clearTaxes,
  addTax,
  removeTax,
}: Props) {
  const [addMoreTaxes, setAddMoreTaxes] = useState(false);
  const { data: taxesData } = useQuery({
    queryKey: ["tax"],
    queryFn: async () => fetch("/api/tax").then((res) => res.json()),
  });

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
          {taxesFromDB.length > 0 ? (
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
              classes="mx-auto my-4 flex h-20 w-full animate-fade-in items-center justify-center border border-dashed border-gray-300"
              onClick={() => setAddMoreTaxes(true)}
            >
              Add more taxes
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
