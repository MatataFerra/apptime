"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore, isEqual } from "date-fns";
import isNaN from "lodash/isNaN";
import { useLocale } from "next-intl";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import { FastChargeFormSchema, Locale } from "@/types";
import { type FastChargeInputs, type FastChargeInputsParsed } from "@/types/forms";

import PopoverBase from "@/components/Popover";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input_v2";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

import onSubmitFastCharge from "@/server-actions/fast-charge";

function FastChargeForm() {
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    setError,
    formState: { touchedFields, errors },
  } = useForm<FastChargeInputs>({
    resolver: zodResolver(FastChargeFormSchema),
  });
  const { data: user } = useUser();

  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");
  const startTimeWatch = watch("start-time");
  const finishTimeWatch = watch("finish-time");
  const fastWorkedWatch = watch("fast-worked");
  const hourValue = watch("hour-value");

  const thisYear = new Date(Date.now()).getFullYear().toString();

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
    const earnings = ShiftService.calculateEarnings({
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: fastWorkedWatch,
      hourValue: Number(hourValue),
    });

    return isNaN(earnings) ? 0 : earnings;
  }, [fastWorkedWatch, formatEnd, formatStart, hourValue]);

  function onSubmit(formData: FastChargeInputs) {
    const parseData: FastChargeInputsParsed = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: formData["fast-holiday"],
      isWorked: formData["fast-worked"],
      holidayPay: !!Number(formData["holiday-pay-rate"]),
      holidayPayRate: Number(formData["holiday-pay-rate"]),
      hourValue: Number(formData["hour-value"]),
      unpaidBreaks: Number(formData["unpaid-breaks"]),
    };

    if (isBefore(new Date(finishDateWatch), new Date(startDateWatch))) {
      setError("finish-date", {
        message: "Finish date must be after start date",
      });

      return;
    }

    if (
      isBefore(new Date(parseData.endDate), new Date(parseData.startDate)) ||
      isEqual(new Date(parseData.endDate), new Date(parseData.startDate))
    ) {
      setError("finish-time", {
        message: "Finish time must be after start date",
      });
      return;
    }

    onSubmitFastCharge(parseData).then((res) => {
      if (res) {
        Toast({
          type: "success",
          duration: 2000,
          message: "Shift created successfully",
        });

        queryClient.invalidateQueries({
          queryKey: ["user", user?.email],
        });

        reset();
      }
    });
  }

  return (
    <>
      <Stack
        as="form"
        orientation="horizontal"
        id="fast-charge"
        wrap
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          classes="h-full"
          label="Start date"
          type="date"
          max={format(new Date(`${thisYear}-12-31`), "yyyy-MM-dd")}
          {...register("start-date")}
        />
        <Input
          classes="h-full"
          label="Finish date"
          type="date"
          isError={!!errors["finish-date"]}
          description={errors["finish-date"]?.message}
          max={format(new Date(`${thisYear}-12-31`), "yyyy-MM-dd")}
          {...register("finish-date")}
        />
        <Input label="Start time" type="time" {...register("start-time")} />
        <Input
          label="Finish time"
          type="time"
          isError={!!errors["finish-time"]}
          description={errors["finish-time"]?.message}
          {...register("finish-time")}
        />
        <Input
          label="Hour value"
          type="number"
          isError={!!errors["hour-value"]}
          description={errors["hour-value"]?.message}
          measure="$"
          measurePlace="left"
          {...register("hour-value")}
        />
        <Input label="Unpaid breaks" type="number" {...register("unpaid-breaks")} />
        <Input
          label="Holiday pay rate"
          measure="%"
          type="number"
          {...register("holiday-pay-rate")}
        />
        <Stack orientation="horizontal" wrap>
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="fast-holiday"
              {...register("fast-holiday")}
            />
            <Text as="label" htmlFor="fast-holiday">
              is it a public holiday?
            </Text>
          </Stack>
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="fast-worked"
              {...register("fast-worked")}
            />
            <Text as="label" htmlFor="fast-worked">
              did you work it?
            </Text>
          </Stack>
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
