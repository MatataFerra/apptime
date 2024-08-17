"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { differenceInMinutes } from "date-fns";
import isEmpty from "lodash/isEmpty";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import DialogValue from "@/components/structures/share/DialogValue";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function DialogHourly({ children }: PropsWithChildren) {
  const {
    values: {
      startDate,
      startTime,
      finishDate,
      finishTime,
      fastWorked,
      hourValue,
      unpaidBreaks,
      fastHoliday,
    },
    dialog,
    setDialogState,
    formError,
  } = useFastChargeStore((state) => state);

  const {
    taxesModule: { salaryElement: taxes },
    contributionsModule: { salaryElement: contributions },
  } = useHourlyTaxesOrContributionsStore((state) => state);

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

  const totalTimeWorked = useMemo(() => {
    const getDifference = differenceInMinutes(formatEnd, formatStart);
    const time = ShiftService.convertDifferenceInHHmm(getDifference);

    return time.text;
  }, [formatEnd, formatStart]);

  const calculateEarn = useMemo(() => {
    const prepareShift = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastHoliday,
      publicHolidayWorked: fastWorked,
      hourValue: Number(hourValue),
      unpaidBreaks: Number(unpaidBreaks),
    };

    const earnings = new ShiftService(prepareShift).checkPublicHoliday().calculateEarnings();

    const getTaxesDiscount = taxes?.reduce((acc, tax) => {
      const value = Number(tax.value);
      const prepareTax = (earnings * value) / 100;
      return (acc -= prepareTax);
    }, earnings);

    return {
      sharp: isNaN(earnings) ? 0 : earnings,
      afterTaxes: isNaN(getTaxesDiscount) ? 0 : getTaxesDiscount,
    };
  }, [fastHoliday, fastWorked, formatEnd, formatStart, hourValue, taxes, unpaidBreaks]);

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
          <DialogDescription>
            <VisuallyHidden.Root>
              Please check the data and submit if everything is ok
            </VisuallyHidden.Root>
          </DialogDescription>
        </DialogHeader>
        <Stack orientation="vertical" classes="mt-4" spacing={4}>
          <DialogValue content="Time details">
            <Text classes="text-sm">
              Start: {new DateHumanizer("short").humanizeDate(new Date(formatStart!))}
            </Text>
            <Text classes="text-sm">
              Finish: {new DateHumanizer("short").humanizeDate(new Date(formatEnd!))}
            </Text>
            <Text classes="text-sm">Total time worked: {totalTimeWorked}</Text>
          </DialogValue>
          <DialogValue content="Job details">
            <Text classes="text-sm">Hour value: ${hourValue}</Text>
          </DialogValue>
          <DialogValue content="Pay details">
            <Text classes="text-sm">Public holiday: {fastHoliday ? "Yes" : "No"}</Text>
            <Text classes="text-sm">Public holiday worked: {fastWorked ? "Yes" : "No"}</Text>
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
          {!isEmpty(contributions) ? (
            <DialogValue content="Contributions">
              <Stack grid cols={3}>
                {contributions?.map((contribution) => (
                  <Text key={contribution.name} classes="text-sm">
                    {contribution.name}: {contribution.value}%
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
          <Button type="submit" size="md" variant="primary" form="fast-charge">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogHourly;
