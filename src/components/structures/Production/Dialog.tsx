"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import DateHumanizer from "@/services/Date";
import ProductionService from "@/services/Shift/Production";

import DialogValue from "@/components/structures/share/DialogValue";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesStore } from "@/store/useTaxStore";

type Props = {};

function DialogProduction({ children }: PropsWithChildren<Props>) {
  const { values, dialog, setDialogState, formError } = useProductionForm((state) => state);
  const { taxes } = useProductionTaxesStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [formError, setDialogState]);

  const calculateEarn = useMemo(() => {
    const earnings = ProductionService.earnings({
      itemValue: Number(values.itemValue ?? 0),
      itemQuantity: Number(values.itemQuantity),
      holidayPayRate: Number(values.holidayPayRate),
      publicHolidayWorked: !!values.publicHolidayWorked,
    });

    const getTaxesDiscount = taxes?.reduce((acc, tax) => {
      const value = Number(tax.value);
      const prepareTax = (earnings * value) / 100;
      return (acc -= prepareTax);
    }, earnings);

    return {
      sharp: isNaN(earnings) ? 0 : earnings,
      afterTaxes: isNaN(getTaxesDiscount) ? 0 : getTaxesDiscount,
    };
  }, [
    taxes,
    values.holidayPayRate,
    values.itemQuantity,
    values.itemValue,
    values.publicHolidayWorked,
  ]);

  return (
    <Dialog open={dialog} onOpenChange={setDialogState}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-[90dvh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Image src="/assets/marks/question_mark.svg" alt="Production" width={50} height={50} />
            <Text variant="subtitle" classes="text-left">
              New Shift will be created with the following details. Please confirm.
            </Text>
          </DialogTitle>
        </DialogHeader>
        <Stack orientation="vertical" classes="mt-4" spacing={4}>
          <DialogValue content="Time details">
            <Text classes="text-sm">
              Start: {new DateHumanizer("short").humanizeDate(new Date(values.startDate!))}
            </Text>
            <Text classes="text-sm">
              Finish: {new DateHumanizer("short").humanizeDate(new Date(values.finishDate!))}
            </Text>
          </DialogValue>
          <DialogValue content="Item details">
            <Text classes="text-sm">Item value: ${values.itemValue}</Text>
            <Text classes="text-sm">Item quantity: {values.itemQuantity}</Text>
          </DialogValue>
          <DialogValue content="Pay details">
            {values.holidayPayRate && (
              <Text classes="text-sm">Holday pay rate: {values.holidayPayRate}%</Text>
            )}
            <Text classes="text-sm">Public holiday: {values.isPublicHoliday ? "Yes" : "No"}</Text>
            <Text classes="text-sm">
              Public holiday worked: {values.publicHolidayWorked ? "Yes" : "No"}
            </Text>
            <Stack>
              <Text classes="rounded-md bg-gradient-to-tl from-lime-400/60 via-green-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
                You will earn: ${calculateEarn.sharp.toFixed(2)}
              </Text>
              {!isEmpty(taxes) && calculateEarn.afterTaxes > 0 ? (
                <Text classes="animate-fade-in rounded-md bg-gradient-to-tl from-red-400/60 to-violet-500/60 px-2 py-1 text-sm font-bold repeat-[2]">
                  After Taxes: ${calculateEarn.afterTaxes.toFixed(2)}
                </Text>
              ) : null}
            </Stack>
          </DialogValue>

          {!isEmpty(taxes) ? (
            <DialogValue content="Taxes">
              <Stack grid cols={3}>
                {taxes?.map((tax) => (
                  <Text key={tax.name} classes="text-sm">
                    {tax.name}: {tax.value}%
                  </Text>
                ))}
              </Stack>
            </DialogValue>
          ) : null}
        </Stack>
        <DialogFooter className="flex flex-row justify-end gap-4">
          <DialogClose asChild>
            <Button size="md" variant="black">
              Close
            </Button>
          </DialogClose>
          <Button type="submit" size="md" variant="primary" form="production-job">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogProduction;
