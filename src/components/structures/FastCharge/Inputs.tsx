import { type ChangeEvent, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import Toast from "@/services/Toast";

import { FastChargeFormCheckDataSchema, UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";
import type { FastChargeInputs } from "@/types/forms";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useSavedTax from "@/hooks/useSavedTax";
import useUser from "@/hooks/useUser";

import onSubmitFastCharge from "@/server-actions/fast-charge";
import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesStore } from "@/store/useTaxStore";

function Inputs() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { clearTaxes, setSaveTaxes, taxes, saveTaxes } = useHourlyTaxesStore((state) => state);

  const savedTaxesFromDB = useSavedTax(user, "hourly");

  const {
    setValues,
    reset: resetValues,
    values: { startDate, finishDate, finishTime, startTime },
    setIsFormReady,
    setDialogState,
  } = useFastChargeStore((state) => state);

  const {
    reset,
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { touchedFields, errors },
  } = useFormContext<FastChargeInputs>();

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  const hourValueWatch = watch("hour-value");

  useEffect(() => {
    const data = {
      startDate: formatStart,
      finishDate: formatEnd,
      hourValue: hourValueWatch,
    };

    const checkData = FastChargeFormCheckDataSchema.safeParse(data);

    if (checkData.success) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [formatEnd, formatStart, hourValueWatch, setIsFormReady]);

  useEffect(() => {
    if (startDate && !touchedFields["finish-date"]) {
      setValue("finish-date", startDate);
      setValues({ finishDate: startDate });
    }
  }, [startDate, setValue, touchedFields, setValues]);

  function onSubmit(formData: FastChargeInputs) {
    const parseData = {
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
      taxes,
      saveTaxes,
    };

    Toast({
      type: "info",
      message: "Your request is being processed",
      description: "Please wait a moment...",
      duration: 1000,
    });

    const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
      "user",
      user?.email,
    ]);

    //* Optimistic update
    queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
      const formatTaxes = taxes.map((tax) => ({
        ...tax,
        id: crypto.randomUUID(),
      }));
      const newHourly = [
        ...(previousUserData?.user?.shifts?.hourly ?? []),
        {
          startDate: parseData.startDate,
          endDate: parseData.endDate,
          holidayPayRate: parseData.holidayPayRate,
          hourValue: parseData.hourValue,
          isPublicHoliday: parseData.isPublicHoliday,
          publicHolidayWorked: parseData.isWorked,
          holidayPay: parseData.holidayPayRate > 0,
          unpaidBreaks: parseData.unpaidBreaks,
          amount: 0,
          isClosed: true,
          notes: "",
          shiftId: user?.shifts?.id,
        },
      ];

      queryClient.setQueryData(["user", user?.email], {
        ...previousUserData,
        user: {
          ...previousUserData?.user,
          profile: {
            ...previousUserData?.user.profile,
          },
          shifts: {
            ...previousUserData?.user.shifts,
            hourly: newHourly,
          },

          config: {
            ...previousUserData?.user.config,
            taxSaved: {
              ...previousUserData?.user.config?.taxSaved,
              hourlyTaxes: saveTaxes ? [...savedTaxesFromDB, ...formatTaxes] : savedTaxesFromDB,
            },
          },
        },
      });

      return { previousUserData };
    });

    resetValues();
    setDialogState(false);
    setSaveTaxes(false);
    clearTaxes();

    onSubmitFastCharge(parseData).then((response) => {
      if (response?.createShift) {
        Toast({
          type: "success",
          duration: 1500,
          message: "Shift created successfully",
        });

        queryClient.invalidateQueries({
          queryKey: ["user", user?.email],
        });

        resetValues();
        clearTaxes();

        return reset();
      }

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

      setSaveTaxes(false);
      setDialogState(false);

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
        <Stack orientation="horizontal" wrap classes="mt-4">
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="fast-holiday"
              {...register("fast-holiday", {
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
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
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
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

export default Inputs;
