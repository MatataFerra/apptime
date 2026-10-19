"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import { FastChargeFormCheckDataSchema, type HourlyType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";
import type { FastChargeInputs } from "@/types/forms";

import { observer } from "@/components/structures/SalaryItems/observer";
import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import { defaultFinish, needsDefaultFinish } from "@/utils/helpers/defaultFinish";
import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";
import useGetUniqueSalaryItems from "@/hooks/useGetUniqueSalaryItems";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";
import type { SalaryItems } from "@/hooks/useSalaryItems";
import useShiftNames from "@/hooks/useShiftNames";
import useUser from "@/hooks/useUser";

import onCreateHourlyShift from "@/server-actions/hourly-job";
import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

/** "2026-10-12" + "08:00" -> "2026-10-12T08:00" (empty until both are set). */
function joinDateTime(date?: string | null, time?: string | null) {
  return date && time ? `${date}T${time}` : "";
}

function Inputs() {
  /*
    Custom hook to get the values from the form
  */
  const {
    setValues: setStoreValue,
    reset: resetStoreValues,
    values: { startDate, finishDate, finishTime, startTime },
    setIsFormReady,
    setDialogState,
  } = useFastChargeStore((state) => state);

  /*
    Custom hook to get the taxes from the store
  */
  const {
    taxesModule: { clear: clearTaxes, salaryElement: taxes },
    contributionsModule: { clear: clearContributions, salaryElement: contributions },
  } = useHourlyTaxesOrContributionsStore((state) => state);

  /*
    Use data and methods from the useForm hook
  */
  const {
    reset,
    control,
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useFormContext<FastChargeInputs>();
  // useWatch, not watch(): the React Compiler would memoize watch() and freeze the value.
  const nameWatch = useWatch({ control, name: "name" });
  const hourValueWatch = useWatch({ control, name: "hour-value" });
  const isPublicHolidayWatch = useWatch({ control, name: "is-public-holiday" });
  const isPublicHolidayWorkedWatch = useWatch({ control, name: "is-public-holiday-worked" });

  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();
  const { names } = useShiftNames({ hourly, production }, nameWatch);

  /*
    set when user is typing to show datalist
  */
  const { setIsWriting } = useDatalistStore((state) => state);

  const { uniqueTaxes, uniqueContributions } = useGetUniqueSalaryItems({
    localTaxes: taxes,
    localContributions: contributions,
  });

  /*
    observe when the submit is done
  */
  const { setDone } = observer();

  /*
    ================================================================================
    ================================================================================
  */

  /*
    Custom hook to format the date and time
  */

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  /*
    Watch the values of the form fields
  */

  useEffect(() => {
    const data = {
      startDate: formatStart,
      finishDate: formatEnd,
      hourValue: hourValueWatch,
    };

    // Check if the data from form is valid
    const checkData = FastChargeFormCheckDataSchema.safeParse(data);

    // If the data is valid, set the form as ready and release the button to submit
    if (checkData.success) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [formatEnd, formatStart, hourValueWatch, setIsFormReady]);

  /*
    ================================================================================
    ================================================================================
  */

  /*
    ================================================================================
    ================================================================================
  */

  /*
    Start and finish are datetime-local inputs (Safari doesn't report changes
    on type="time"). They still fill the four fields the schema, Submit and the
    review read: start/finish date and time.
  */
  function setDateTime(which: "start" | "finish", value: string) {
    const [date = "", time = ""] = value.split("T");
    const opts = { shouldValidate: true, shouldDirty: true };
    setValue(`${which}-date`, date, opts);
    setValue(`${which}-time`, time, opts);
    setStoreValue(
      which === "start"
        ? { startDate: date, startTime: time }
        : { finishDate: date, finishTime: time }
    );
  }

  function onSubmit(formData: FastChargeInputs) {
    const parseData = {
      startDate: formatStart,
      endDate: formatEnd,
      isPublicHoliday: formData["is-public-holiday"] ?? false,
      isWorked: formData["is-public-holiday-worked"] ?? false,
      hourValue: isNaN(Number(formData["hour-value"])) ? 0 : Number(formData["hour-value"]),
      name: formData["name"],
      unpaidBreaks: isNaN(Number(formData["unpaid-breaks"]))
        ? 0
        : Number(formData["unpaid-breaks"]),
      taxes,
      contributions,
    };

    Toast({
      type: "loading",
      message: "Your request is being processed",
      description: "Please wait a moment...",
      duration: 2500,
    });

    const previousUserData = queryClient.getQueryData<SuccessApiResponse<HourlyType[]>>([
      USE_QUERY_KEYS.HOURLY,
    ]);

    const previousSalaryItemsData = queryClient.getQueryData<SuccessApiResponse<SalaryItems>>([
      USE_QUERY_KEYS.SALARY,
    ]);

    //* Optimistic update
    queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.SALARY] }).then(() => {
      const prevTaxes = previousSalaryItemsData?.salaryItems.taxes.map((taxes) => {
        return {
          ...taxes,
        };
      });

      const prevContributions = previousSalaryItemsData?.salaryItems.contributions.map(
        (contributions) => {
          return {
            ...contributions,
          };
        }
      );

      const lastIdTax = prevTaxes?.at(-1)?.id ?? Math.random();
      const lastIdContribution = prevContributions?.at(-1)?.id ?? Math.random();

      const uniqueTax = uniqueTaxes?.map((tax) => ({
        ...tax,
        id: lastIdTax + 1,
      }));

      const uniqueContribution = uniqueContributions?.map((contribution) => ({
        ...contribution,
        id: lastIdContribution + 1,
      }));

      const all = prevTaxes?.concat(uniqueTax ?? []);
      const allContributions = prevContributions?.concat(uniqueContribution ?? []);

      queryClient.setQueryData(["salary"], {
        ...previousSalaryItemsData,
        salaryItems: {
          taxes: all,
          contributions: allContributions,
        },
      });

      return { previousSalaryItemsData };
    });

    //* Optimistic update
    queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] }).then(() => {
      const lastId = previousUserData?.hourly?.at(-1)?.id ?? Math.random();

      const newHourly = [
        ...(previousUserData?.hourly ?? []),
        {
          id: lastId + 1,
          startDate: parseData.startDate,
          endDate: parseData.endDate,
          name: parseData.name,
          hourValue: parseData.hourValue,
          isPublicHoliday: parseData.isPublicHoliday,
          publicHolidayWorked: parseData.isWorked,
          unpaidBreaks: parseData.unpaidBreaks,
          amount: 0,
          isClosed: true,
          notes: "",
          shiftId: user?.shifts?.id,
          taxes: parseData.taxes,
          contributions: parseData.contributions,
        },
      ];

      queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], {
        ...previousUserData,
        hourly: [...newHourly],
      });

      return { previousUserData };
    });

    setDialogState(false);

    onCreateHourlyShift(parseData).then((response) => {
      setDone(true);
      if (response?.response) {
        Toast({
          type: "success",
          duration: 1500,
          message: "Shift created successfully",
        });

        resetStoreValues();
        clearTaxes();
        clearContributions();

        return reset();
      }

      queryClient.invalidateQueries({
        queryKey: [USE_QUERY_KEYS.USER, user?.email],
      });

      queryClient.invalidateQueries({
        queryKey: [USE_QUERY_KEYS.SALARY],
      });

      queryClient.invalidateQueries({
        queryKey: [USE_QUERY_KEYS.HOURLY],
      });

      // reset state if the shift was not created
      queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] }).then(() => {
        queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], {
          ...previousUserData,
          hourly: previousUserData?.hourly,
        });

        return { previousUserData };
      });

      queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.SALARY] }).then(() => {
        queryClient.setQueryData([USE_QUERY_KEYS.SALARY], {
          ...previousSalaryItemsData,
          salaryItems: {
            ...previousSalaryItemsData?.salaryItems,
          },
        });

        return { previousSalaryItemsData };
      });

      setDialogState(false);

      resetStoreValues();
      clearTaxes();
      clearContributions();

      reset();

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 3000,
      });
    });
  }

  const [thisYear] = useState(() => String(new Date().getFullYear()));

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
        <Stack as="fieldset" orientation="vertical" classes="relative w-full">
          <Input
            label="Name of your job"
            variant="outlined"
            type="name"
            isError={!!errors["name"]}
            description={errors["name"]?.message}
            onKeyDown={() => setIsWriting(true)}
            {...register("name", {
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                setStoreValue({ name: e.target.value });
              },
            })}
          />
          <DatalistShiftNames
            data={names}
            value={nameWatch}
            onSelect={(name) => {
              setValue("name", name, { shouldValidate: true, shouldDirty: true });
              setStoreValue({ name });
            }}
          />
        </Stack>
        <Input
          containerClasses="flex-1"
          classes="h-full"
          label="Start"
          name="start-datetime"
          type="datetime-local"
          isError={!!(errors["start-date"] || errors["start-time"])}
          description={errors["start-date"]?.message ?? errors["start-time"]?.message}
          max={`${thisYear}-12-31T23:59`}
          value={joinDateTime(startDate, startTime)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const start = e.target.value;
            setDateTime("start", start);

            // A shift rarely spans days: suggest a finish 8h later, same day.
            const finish = joinDateTime(finishDate, finishTime);
            if (start && needsDefaultFinish(start, finish)) {
              setDateTime("finish", defaultFinish(start));
            }
          }}
        />
        <Input
          containerClasses="flex-1"
          classes="h-full"
          label="Finish"
          name="finish-datetime"
          type="datetime-local"
          isError={!!(errors["finish-date"] || errors["finish-time"])}
          description={errors["finish-date"]?.message ?? errors["finish-time"]?.message}
          max={`${thisYear}-12-31T23:59`}
          value={joinDateTime(finishDate, finishTime)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDateTime("finish", e.target.value)}
        />
        <Input
          label="Hour value"
          type="number"
          step="0.01"
          min={0}
          measure="$"
          measurePlace="left"
          {...register("hour-value", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setStoreValue({ hourValue: e.target.value });
            },
          })}
        />
        <Input
          label="Unpaid breaks"
          measure="min."
          type="number"
          {...register("unpaid-breaks", {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              setStoreValue({ unpaidBreaks: e.target.value });
            },
          })}
        />
        <input type="checkbox" hidden {...register("is-public-holiday")} />
        <input type="checkbox" hidden {...register("is-public-holiday-worked")} />
        <div className="mt-2 w-full">
          <HolidayChoice
            value={toHolidayValue(isPublicHolidayWatch, isPublicHolidayWorkedWatch)}
            onChange={(next) => {
              const { isPublicHoliday, publicHolidayWorked } = fromHolidayValue(next);
              setValue("is-public-holiday", isPublicHoliday);
              setValue("is-public-holiday-worked", publicHolidayWorked);
              setStoreValue({ fastHoliday: isPublicHoliday, fastWorked: publicHolidayWorked });
            }}
          />
        </div>
      </Stack>
    </>
  );
}

export default Inputs;
