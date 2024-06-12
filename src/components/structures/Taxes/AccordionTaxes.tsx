"use client";

import { type ChangeEvent, useState } from "react";

import type { Tax, TaxHourlySaved, TaxProductionSaved } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

import AccordionFaq from "@/components/structures/Taxes/AccordionFaq";
import InputTax from "@/components/structures/Taxes/InputTax";
import TableTax from "@/components/structures/Taxes/Table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";
import TableHead from "@/components/ui/TableHead";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

import remove from "@/server-actions/remove-tax";

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
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  function removeSaveTax(taxItem: any) {
    const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
      "user",
      user?.email,
    ]);
    //* Optimistic update
    queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
      queryClient.setQueryData(["user", user?.email], {
        ...previousUserData,
        user: {
          ...previousUserData?.user,

          config: {
            ...previousUserData?.user.config,
            taxSaved: {
              ...previousUserData?.user.config?.taxSaved,
              hourlyTaxes:
                type === "hourly"
                  ? previousUserData?.user.config?.taxSaved?.hourlyTaxes?.filter(
                      (tax) => tax.id !== taxItem?.id
                    )
                  : previousUserData?.user.config?.taxSaved?.hourlyTaxes,
              productionTaxes:
                type === "production"
                  ? previousUserData?.user.config?.taxSaved?.productionTaxes?.filter(
                      (tax) => tax.id !== taxItem?.id
                    )
                  : previousUserData?.user.config?.taxSaved?.productionTaxes,
            },
          },
        },
      });

      return { previousUserData };
    });
    remove(type, taxItem).then((response) => {
      queryClient.invalidateQueries({
        queryKey: ["user", user?.email],
      });

      if (!response) {
        // reset state if the shift was not created
        queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
          queryClient.setQueryData(["user", user?.email], {
            ...previousUserData,
            user: {
              ...previousUserData?.user,
              profile: {
                ...previousUserData?.user.profile,
              },
              shifts: {
                ...previousUserData?.user.shifts,
                hourly: previousUserData?.user.shifts?.hourly,
              },
            },
          });

          return { previousUserData };
        });

        return;
      }
    });
  }

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
            <>
              <Text variant="body">Use your saved taxes</Text>
              <Table classes="my-4 w-full rounded-md border border-slate-300/40 p-4">
                <TableHead
                  classes="bg-slate-200"
                  elementClasses="p-2 text-left"
                  columnTitle={["Name", "Value", "Description", "Action"]}
                />
                <TableBody>
                  {taxesFromDB.map((tax) => (
                    <TableElement as="tr" key={tax.id} classes="w-full !cursor-auto">
                      <TableElement>{tax.name}</TableElement>
                      <TableElement>{tax.value}%</TableElement>
                      <TableElement>{tax.description}</TableElement>
                      <TableElement>
                        <Button
                          type="button"
                          variant="outlined"
                          size="xs"
                          classes="bg-gradient-to-tl from-red-500 via-salmon to-pink-700  font-semibold text-stone-100"
                          onClick={() => {
                            removeSaveTax(tax);
                          }}
                        >
                          Remove
                        </Button>
                      </TableElement>
                    </TableElement>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Stack
              classes="h-20 w-full bg-slate-100/60"
              justifyContent="center"
              alignItems="center"
            >
              No taxes saved
            </Stack>
          )}

          {addMoreTaxes && (
            <>
              <Line classes="my-4" color="bg-stone-600/40" />
              <Stack orientation="vertical" alignItems="center" classes="px-4 py-2">
                <InputTax addTax={addTax} />
                <TableTax emptyContent={emptyTableText} removeTax={removeTax} data={taxes} />
              </Stack>
              {taxes.length > 0 && (
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
              {taxes.length > 0 && (
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
