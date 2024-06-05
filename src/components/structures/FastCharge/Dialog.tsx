"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

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

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";

import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesStore } from "@/store/useTaxStore";

type Props = {};

function DialogHourly({ children }: PropsWithChildren<Props>) {
  const {
    values: {
      startDate,
      startTime,
      finishDate,
      finishTime,
      fastWorked,
      hourValue,
      holidayPayRate,
      unpaidBreaks,
      fastHoliday,
    },
    dialog,
    setDialogState,
    formError,
  } = useFastChargeStore((state) => state);
  const { taxes, saveTaxes } = useHourlyTaxesStore((state) => state);

  useEffect(() => {
    if (formError) return setDialogState(false);
  }, [formError, setDialogState]);

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  const calculateProductionEarn = useMemo(() => {
    const earnings = ShiftService.calculateEarnings({
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastWorked,
      hourValue: Number(hourValue),
      holidayPayRate: Number(holidayPayRate),
      unpaidBreaks: Number(unpaidBreaks),
    });

    return isNaN(earnings) ? 0 : earnings;
  }, [fastWorked, formatEnd, formatStart, holidayPayRate, hourValue, unpaidBreaks]);

  return (
    <Dialog open={dialog} onOpenChange={setDialogState}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
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
              Start: {new DateHumanizer("short").humanizeDate(new Date(formatStart!))}
            </Text>
            <Text classes="text-sm">
              Finish: {new DateHumanizer("short").humanizeDate(new Date(formatEnd!))}
            </Text>
          </DialogValue>
          <DialogValue content="Job details">
            <Text classes="text-sm">Hour value: ${hourValue}</Text>
          </DialogValue>
          <DialogValue content="Pay details">
            {holidayPayRate && <Text classes="text-sm">Holday pay rate: {holidayPayRate}%</Text>}
            <Text classes="text-sm">Public holiday: {fastHoliday ? "Yes" : "No"}</Text>
            <Text classes="text-sm">Public holiday worked: {fastWorked ? "Yes" : "No"}</Text>
            <Text classes="rounded-md bg-gradient-to-tl from-lime-400/60 via-green-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
              You will earn: ${calculateProductionEarn.toFixed(2)}
            </Text>
          </DialogValue>
          <DialogValue content="Taxes">
            {taxes.map((tax) => (
              <Text key={tax.name.split(" ").join("-")} classes="text-sm">
                {tax.name}: <kbd>{tax.value}%</kbd>
              </Text>
            ))}
            {saveTaxes ? (
              <Text classes="rounded-md bg-gradient-to-tl from-lime-400/60 via-green-400 to-teal-500/60 px-2 py-1 text-sm font-bold">
                {"Taxes saved"}
              </Text>
            ) : (
              <Text classes="rounded-md bg-gradient-to-tl from-stone-400/60 via-slate-400 to-stone-500/60 px-2 py-1 text-sm font-bold">
                {"Taxes haven't been saved"}
              </Text>
            )}
          </DialogValue>
        </Stack>
        <DialogFooter className="flex flex-row justify-end gap-4">
          <DialogClose asChild>
            <Button size="md" variant="black">
              Close
            </Button>
          </DialogClose>
          <Button type="submit" size="md" variant="primary" form="fast-charge">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogHourly;
