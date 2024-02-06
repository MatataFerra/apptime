"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { isNaN } from "lodash";
import { useLocale } from "next-intl";
import { z } from "zod";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { Locale } from "@/types";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useQueryUser from "@/hooks/useQueryUser";

import PopoverBase from "../Popover";

type Inputs = {
  "start-date": string;
  "finish-date": string;
  "start-time": string;
  "finish-time": string;
  "fast-holiday": boolean;
};

const FastChargeFormSchema = z.object({
  "start-date": z.string().length(10),
  "finish-date": z.string().length(10),
  "start-time": z.string().length(5),
  "finish-time": z.string().length(5),
  "fast-holiday": z.boolean(),
});

function FastChargeForm() {
  const locale = useLocale() as Locale;
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { touchedFields },
  } = useForm<Inputs>({
    resolver: zodResolver(FastChargeFormSchema),
  });
  const user = useQueryUser();

  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");
  const startTimeWatch = watch("start-time");
  const finishTimeWatch = watch("finish-time");
  const fastHolidayWatch = watch("fast-holiday");

  useEffect(() => {
    if (startDateWatch && !touchedFields["finish-date"]) {
      setValue("finish-date", startDateWatch);
    }
  }, [startDateWatch, setValue, touchedFields]);

  const formatStart = useMemo(() => {
    const date = new DateHumanizer("formatAndAddTime").humanizeDate(
      new Date(startDateWatch ?? ""),
      { time: startTimeWatch ?? "" }
    );

    return date;
  }, [startDateWatch, startTimeWatch]);

  const formatEnd = useMemo(() => {
    const date = new DateHumanizer("formatAndAddTime").humanizeDate(
      new Date(finishDateWatch ?? ""),
      { time: finishTimeWatch ?? "" }
    );

    return date;
  }, [finishDateWatch, finishTimeWatch]);

  const humanizeStartDate = useMemo(() => {
    const humanized = startDateWatch
      ? new DateHumanizer("today").humanizeDate(new Date(startDateWatch), {
          locale: locale,
        })
      : null;

    return humanized ? humanized : "waiting...";
  }, [startDateWatch, locale]);

  const shift = useMemo(() => {
    if (startDateWatch && finishDateWatch && startTimeWatch && finishTimeWatch) {
      const start = new Date(formatStart);
      const end = new Date(formatEnd);

      const shift = ShiftService.differenceInHHmm(start, end);

      return shift;
    }

    return null;
  }, [finishDateWatch, finishTimeWatch, formatEnd, formatStart, startDateWatch, startTimeWatch]);

  const calculateEarnings = useMemo(() => {
    if (user?.profile) {
      const earnings = ShiftService.calculateEarnings({
        profile: user.profile,
        startDate: formatStart,
        endDate: formatEnd,
        isPublicHoliday: fastHolidayWatch,
      });

      return isNaN(earnings) ? 0 : earnings;
    }

    return 0;
  }, [formatEnd, formatStart, user?.profile, fastHolidayWatch]);

  function onSubmit(data: Inputs) {
    // not implemented
  }

  return (
    <>
      <Stack as="form" grid cols={2} id="fast-charge" onSubmit={handleSubmit(onSubmit)}>
        <Input
          classes="text-base"
          label="Start date"
          type="date"
          // create a function to get the current year, give more flexibility
          max={format(new Date("2024-12-31"), "yyyy-MM-dd")}
          {...register("start-date")}
        />
        <Input
          classes="text-base"
          label="Finish date"
          type="date"
          max={format(new Date("2024-12-31"), "yyyy-MM-dd")}
          {...register("finish-date")}
        />
        <Input classes="text-base" label="Start time" type="time" {...register("start-time")} />
        <Input classes="text-base" label="Finish time" type="time" {...register("finish-time")} />
        <Stack alignItems="center">
          <Input classes="size-4" type="checkbox" id="fast-holiday" {...register("fast-holiday")} />
          <Text as="label" htmlFor="fast-holiday">
            is it a holiday?
          </Text>
        </Stack>
      </Stack>
      <Stack orientation="vertical">
        <Text variant="subtitle" classes="text-sm">
          You are going to charge:
        </Text>
        <Text classes="text-sm">Start date: {humanizeStartDate}</Text>
        <Text classes="text-sm">Worked time: {shift?.text ? shift.text : "expecting data..."}</Text>
        <Text classes="text-sm">
          Estimated earnings: <PopoverBase content={`Without taxes`} classes="w-fit" /> $
          {String(calculateEarnings)}
        </Text>
      </Stack>
      <Stack justifyContent="end" classes="w-full">
        <Button type="submit" variant="black" form="fast-charge">
          Submit
        </Button>
      </Stack>
    </>
  );
}

export default FastChargeForm;
