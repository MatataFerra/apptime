"use client";

import { type ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore, isEqual, isValid } from "date-fns";

import Toast from "@/services/Toast";

import { FastChargeFormSchema } from "@/types";
import { type FastChargeInputs, FastChargeInputsParsed } from "@/types/forms";

import Input from "@/components/ui/Input_v2";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useUser from "@/hooks/useUser";

import onSubmitFastCharge from "@/server-actions/fast-charge";
import { useFastChargeStore } from "@/store/useFastChargeStore";

function FastChargeFormInputs() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const {
    setValues,
    values: { startDate, finishDate, finishTime, startTime },
  } = useFastChargeStore((state) => state);

  const {
    register,
    setValue,
    formState: { touchedFields, errors },
    setFocus,
    setError,
    handleSubmit,
    clearErrors,
  } = useForm<FastChargeInputs>({
    resolver: zodResolver(FastChargeFormSchema),
  });
  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  useEffect(() => {
    if (startDate && !touchedFields["finish-date"]) {
      setValue("finish-date", startDate);
      setValues({ finishDate: startDate });

      if (errors["finish-date"]) clearErrors("finish-date");
    }
  }, [startDate, setValue, touchedFields, setValues, errors, clearErrors]);

  function onSubmit(formData: FastChargeInputs) {
    Toast({
      type: "info",
      message: "Your request is being processed",
      description: "Please wait a moment...",
      duration: 1000,
    });

    if (isBefore(new Date(finishDate ?? ""), new Date(startDate ?? ""))) {
      setError("finish-date", {
        type: "manual",
        message: "Finish date must be after start date",
      });
      setFocus("finish-date");
      return;
    }

    if (isEqual(new Date(formatEnd), new Date(formatStart))) {
      setError("finish-time", {
        type: "manual",
        message: "Finish time must be after start time",
      });
      setFocus("finish-time");
      return;
    }

    if (!isValid(new Date(formatEnd))) {
      setError("finish-date", {
        type: "manual",
        message: "Finish date is invalid",
      });

      setError("finish-time", {
        type: "manual",
        message: "Invalid time",
      });
      return;
    }

    const parseData: FastChargeInputsParsed = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: formData["fast-holiday"] ?? false,
      isWorked: formData["fast-worked"] ?? false,
      holidayPay: !!Number(formData["holiday-pay-rate"]),
      holidayPayRate: isNaN(Number(formData["holiday-pay-rate"]))
        ? 0
        : Number(formData["holiday-pay-rate"]),
      hourValue: isNaN(Number(formData["hour-value"])) ? 0 : Number(formData["hour-value"]),
      unpaidBreaks: isNaN(Number(formData["unpaid-breaks"]))
        ? 0
        : Number(formData["unpaid-breaks"]),
    };

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
      }

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 3000,
      });
    });
  }

  const thisYear = new Date(Date.now()).getFullYear().toString();

  return (
    <>
      <Stack
        as="form"
        classes="w-full"
        orientation="horizontal"
        id="fast-charge"
        wrap
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          classes="h-full"
          label="Start date"
          type="date"
          isError={!!errors["start-date"]}
          description={errors["start-date"]?.message}
          max={format(new Date(`${thisYear}-12-31`), "yyyy-MM-dd")}
          {...register("start-date", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ startDate: e.target.value });
            },

            required: true,
          })}
        />
        <Input
          classes="h-full"
          label="Finish date"
          type="date"
          isError={!!errors["finish-date"]}
          description={errors["finish-date"]?.message}
          max={format(new Date(`${thisYear}-12-31`), "yyyy-MM-dd")}
          {...register("finish-date", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ finishDate: e.target.value });
            },
          })}
        />
        <Input
          label="Start time"
          type="time"
          isError={!!errors["start-time"]}
          description={errors["start-time"]?.message}
          {...register("start-time", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ startTime: e.target.value });
            },
          })}
        />
        <Input
          label="Finish time"
          type="time"
          isError={!!errors["finish-time"]}
          description={errors["finish-time"]?.message}
          {...register("finish-time", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ finishTime: e.target.value });
            },
          })}
        />
        <Input
          label="Hour value"
          type="number"
          measure="$"
          measurePlace="left"
          {...register("hour-value", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ hourValue: e.target.value });
            },
          })}
        />
        <Input
          label="Unpaid breaks"
          type="number"
          {...register("unpaid-breaks", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ unpaidBreaks: e.target.value });
            },
          })}
        />
        <Input
          label="Holiday pay rate"
          measure="%"
          type="number"
          {...register("holiday-pay-rate", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setValues({ holidayPayRate: e.target.value });
            },
          })}
        />
        <Stack orientation="horizontal" wrap>
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="fast-holiday"
              {...register("fast-holiday", {
                onChange: (e) => {
                  setValues({
                    fastHoliday: e.target.checked as boolean,
                  });
                },
              })}
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
              {...register("fast-worked", {
                onChange: (e) => {
                  setValues({
                    fastWorked: e.target.checked as boolean,
                  });
                },
              })}
            />
            <Text as="label" htmlFor="fast-worked">
              did you work it?
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

export default FastChargeFormInputs;
