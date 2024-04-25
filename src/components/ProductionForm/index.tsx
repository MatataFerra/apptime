"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { isBefore } from "date-fns";
import isNaN from "lodash/isNaN";

import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import { ProductionJobFormSchema } from "@/types";
import { type ProductionInputs } from "@/types/forms";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input_v2";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useHumanizeDate from "@/hooks/useHumanizeDate";
import useUser from "@/hooks/useUser";

import FormReport from "../FormReport/index";
import onSubmitProductionJob from "@/server-actions/production-job";

function ProductionJobForm() {
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ProductionInputs>({
    resolver: zodResolver(ProductionJobFormSchema),
  });
  const { data: user } = useUser();

  const humanizeStartDate = useHumanizeDate({ date: watch("start-date") });
  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");
  const itemValueWatch = watch("item-value");
  const itemQuantityWatch = watch("item-quantity");
  const hourValueWatch = watch("hour-value");
  const holidayPayRateWatch = watch("holiday-pay-rate");
  const isPublicHolidayWatch = watch("is-public-holiday");
  const isWorkedWatch = watch("is-worked");

  const calculateProductionEarn = useMemo(() => {
    const earnings = ShiftService.calculateProductionEarnings({
      hourValue: parseFloat(hourValueWatch),
      itemValue: parseFloat(itemValueWatch),
      itemQuantity: parseFloat(itemQuantityWatch),
      holidayPayRate: parseFloat(holidayPayRateWatch),
      isPublicHoliday: isPublicHolidayWatch,
      publicHolidayWorked: isWorkedWatch,
    });

    return isNaN(earnings) ? 0 : earnings;
  }, [
    holidayPayRateWatch,
    hourValueWatch,
    isPublicHolidayWatch,
    isWorkedWatch,
    itemQuantityWatch,
    itemValueWatch,
  ]);

  const shift = useMemo(() => {
    if (startDateWatch && finishDateWatch) {
      const start = new Date(startDateWatch);
      const end = new Date(finishDateWatch);

      const shift = ShiftService.differenceInHHmm(start, end);

      return shift;
    }

    return null;
  }, [startDateWatch, finishDateWatch]);

  function onSubmit(formData: ProductionInputs) {
    const parseData = {
      startDate: new Date(formData["start-date"]).toString(),
      endDate: new Date(formData["finish-date"]).toString(),
      itemValue: parseFloat(formData["item-value"]),
      holidayPayRate: parseFloat(formData["holiday-pay-rate"]),
      itemQuantity: parseFloat(formData["item-quantity"]),
      hourValue: parseFloat(formData["hour-value"]),
      isPublicHoliday: formData["is-public-holiday"],
      publicHolidayWorked: formData["is-worked"],
    };

    if (isBefore(new Date(finishDateWatch), new Date(startDateWatch))) {
      setError("finish-date", {
        message: "Finish date must be after start date",
      });

      setFocus("finish-date");

      return;
    }

    Toast({
      type: "info",
      message: "Your request is being processed",
      description: "Please wait a moment...",
      duration: 3000,
    });

    onSubmitProductionJob(parseData).then((response: any) => {
      if (response) {
        queryClient.invalidateQueries({
          queryKey: ["user", user?.email],
        });
        Toast({
          type: "success",
          message: "Success",
          description: "Shift created successfully",
          duration: 3000,
        });

        return reset();
      }

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 3000,
      });
    });
  }

  return (
    <>
      <Stack
        as="form"
        orientation="horizontal"
        id="production-job"
        wrap
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          classes="h-full"
          label="Start date"
          type="datetime-local"
          {...register("start-date")}
        />
        <Input
          classes="h-full"
          label="Finish date"
          type="datetime-local"
          isError={!!errors["finish-date"]}
          description={errors["finish-date"]?.message}
          {...register("finish-date")}
        />
        <Input
          label="Hour value"
          type="number"
          measure="$"
          measurePlace="left"
          {...register("hour-value")}
        />
        <Input
          label="Item value"
          type="number"
          step={"any"}
          measure="$"
          measurePlace="left"
          {...register("item-value")}
        />
        <Input label="Quantity" type="number" {...register("item-quantity")} />
        <Input
          label="Holiday pay rate"
          min={0}
          measure="%"
          type="number"
          {...register("holiday-pay-rate")}
        />
        <Stack orientation="horizontal" wrap>
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="production-holiday"
              {...register("is-public-holiday")}
            />
            <Text as="label" htmlFor="production-holiday">
              is it a public holiday?
            </Text>
          </Stack>
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="production-worked"
              {...register("is-worked")}
            />
            <Text as="label" htmlFor="production-worked">
              did you work it?
            </Text>
          </Stack>
        </Stack>
      </Stack>
      <FormReport
        startDate={humanizeStartDate}
        workedTime={shift?.text}
        earnings={calculateProductionEarn}
      />
      <Stack justifyContent="end" classes="w-full">
        <Button type="submit" variant="black" form="production-job">
          Submit
        </Button>
      </Stack>
    </>
  );
}

export default ProductionJobForm;
