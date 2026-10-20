"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import { ProductionJobFormCheckDataSchema, type ProductionType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";
import type { ProductionInputs } from "@/types/forms";

import { observer } from "@/components/structures/SalaryItems/observer";
import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { currencySymbol } from "@/utils/constants/currencies";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import { defaultFinish, needsDefaultFinish } from "@/utils/helpers/defaultFinish";
import useGetUniqueSalaryItems from "@/hooks/useGetUniqueSalaryItems";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";
import type { SalaryItems } from "@/hooks/useSalaryItems";
import useShiftNames from "@/hooks/useShiftNames";
import useUser from "@/hooks/useUser";

import onCreateProductionShift from "@/server-actions/production-job";
import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

function Inputs() {
  /*
    Custom hook to get the values from the form
  */
  const {
    setValues: setStoreValues,
    reset: resetStoreValues,
    setIsFormReady,
    setDialogState,
  } = useProductionForm((state) => state);
  const shiftCurrency = useProductionForm((state) => state.values.currency);
  const defaultCurrency = useCurrency();

  /*
    Custom hook to get the taxes from the store
  */
  const {
    taxesModule: { clear: clearTaxes, salaryElement: taxes },
    contributionsModule: { clear: clearContributions, salaryElement: contributions },
  } = useProductionTaxesOrContributionsStore((state) => state);
  /*
    Use data and methods from the useForm hook
  */
  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductionInputs>();
  // useWatch, not watch(): the React Compiler would memoize watch() and freeze the value.
  const nameWatch = useWatch({ control, name: "name" });
  const startDateWatch = useWatch({ control, name: "start-date" });
  const finishDateWatch = useWatch({ control, name: "finish-date" });
  const itemValueWatch = useWatch({ control, name: "item-value" });
  const itemQuantityWatch = useWatch({ control, name: "item-quantity" });
  const isPublicHolidayWatch = useWatch({ control, name: "is-public-holiday" });
  const isWorkedWatch = useWatch({ control, name: "is-worked" });

  /*
    observe when the submit is done
  */
  const { setDone } = observer();

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
    ================================================================================
    ================================================================================
  */

  /*
    Watch the values of the form fields
  */

  useEffect(() => {
    const data = {
      startDate: startDateWatch,
      finishDate: finishDateWatch,
      itemValue: itemValueWatch,
      itemQuantity: itemQuantityWatch,
    };

    // Check if the data from form is valid
    const checkData = ProductionJobFormCheckDataSchema.safeParse(data);

    // If the data is valid, set the form as ready and release the button to submit
    if (checkData.success) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [finishDateWatch, itemQuantityWatch, itemValueWatch, setIsFormReady, startDateWatch]);

  /*
    ================================================================================
    ================================================================================
  */

  function onSubmit(formData: ProductionInputs) {
    const parseData = {
      startDate: new Date(formData["start-date"]).toString(),
      endDate: new Date(formData["finish-date"]).toString(),
      itemValue: parseFloat(formData["item-value"]),
      itemQuantity: parseFloat(formData["item-quantity"]),
      isPublicHoliday: formData["is-public-holiday"],
      publicHolidayWorked: formData["is-worked"],
      name: formData["name"],
      taxes,
      contributions,
      currency: shiftCurrency ?? null,
    };

    Toast({
      type: "loading",
      message: "Your request is being processed",
      description: "Please wait a moment...",
      duration: Infinity,
    });

    const previousUserData = queryClient.getQueryData<SuccessApiResponse<ProductionType[]>>([
      USE_QUERY_KEYS.PRODUCTION,
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

      // Placeholder rows until the refetch brings the saved ones.
      const uniqueTax = uniqueTaxes?.map((tax) => ({
        ...tax,
        id: lastIdTax + 1,
        archived: false,
        userId: null,
        // Saved with this shift, so one shift uses it.
        uses: 1,
      }));

      const uniqueContribution = uniqueContributions?.map((contribution) => ({
        ...contribution,
        id: lastIdContribution + 1,
        archived: false,
        userId: null,
        // Saved with this shift, so one shift uses it.
        uses: 1,
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
    queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.PRODUCTION] }).then(() => {
      const lastId = previousUserData?.production?.at(-1)?.id ?? Math.random();

      const newProduction = [
        ...(previousUserData?.production ?? []),
        {
          id: lastId + 1,
          startDate: parseData.startDate,
          currency: parseData.currency,
          endDate: parseData.endDate,
          name: parseData.name,
          amount: 0,
          isClosed: true,
          notes: "",
          itemValue: parseData.itemValue,
          itemQuantity: parseData.itemQuantity,
          shiftId: user?.shifts?.id,
          isPublicHoliday: parseData.isPublicHoliday,
          publicHolidayWorked: parseData.publicHolidayWorked,
          taxes: parseData.taxes,
          contributions: parseData.contributions,
        },
      ];

      queryClient.setQueryData([USE_QUERY_KEYS.PRODUCTION], {
        ...previousUserData,
        production: [...newProduction],
      });

      return { previousUserData };
    });

    setDialogState(false);

    onCreateProductionShift(parseData).then((response) => {
      setDone(true);
      if (response?.response) {
        Toast({
          type: "success",
          message: "Success",
          description: "Shift created successfully",
          duration: 3000,
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
        queryKey: [USE_QUERY_KEYS.PRODUCTION],
      });

      queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.PRODUCTION] }).then(() => {
        queryClient.setQueryData([USE_QUERY_KEYS.PRODUCTION], {
          ...previousUserData,
          production: previousUserData?.production,
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

  return (
    <>
      <Stack
        as="form"
        orientation="horizontal"
        id="production-job"
        wrap
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack as="fieldset" orientation="vertical" classes="relative w-full">
          <Input
            containerClasses="grow"
            variant="outlined"
            label="Name of your job"
            type="name"
            isError={!!errors["name"]}
            description={errors["name"]?.message}
            onKeyDown={() => setIsWriting(true)}
            {...register("name", {
              onChange: (e) => {
                setStoreValues({ name: e.target.value });
              },
            })}
          />
          <DatalistShiftNames
            data={names}
            value={nameWatch}
            onSelect={(name) => {
              setValue("name", name, { shouldValidate: true, shouldDirty: true });
              setStoreValues({ name });
            }}
          />
        </Stack>
        <Stack grid cols={2} as="fieldset" classes="w-full">
          <Input
            classes="h-full"
            label="Start date"
            type="datetime-local"
            {...register("start-date", {
              onChange(e) {
                const start = e.target.value;
                setStoreValues({ startDate: start });

                // A shift rarely spans days: suggest a finish on the same day.
                if (start && needsDefaultFinish(start, getValues("finish-date"))) {
                  const finish = defaultFinish(start);
                  setValue("finish-date", finish, { shouldValidate: true });
                  setStoreValues({ finishDate: finish });
                }
              },
            })}
          />
          <Input
            classes="h-full"
            label="Finish date"
            type="datetime-local"
            isError={!!errors["finish-date"]}
            description={errors["finish-date"]?.message}
            {...register("finish-date", {
              onChange(e) {
                setStoreValues({ finishDate: e.target.value });
              },
            })}
          />
        </Stack>
        <Input
          containerClasses="flex-1 sm:flex-auto"
          labelClasses="text-xs"
          label="Value of each item"
          min={0}
          type="number"
          step={"any"}
          measure={currencySymbol(shiftCurrency || defaultCurrency)}
          description="What you're paid for each bin, box or piece"
          measurePlace="left"
          {...register("item-value", {
            onChange(e) {
              setStoreValues({ itemValue: e.target.value });
            },
          })}
        />
        <Input
          containerClasses="flex-1 sm:flex-auto"
          label="Quantity"
          min={0}
          type="number"
          {...register("item-quantity", {
            onChange(e) {
              setStoreValues({ itemQuantity: e.target.value });
            },
          })}
        />
        <CurrencySelect
          value={shiftCurrency}
          onChange={(currency) => setStoreValues({ currency })}
        />
        <input type="checkbox" hidden {...register("is-public-holiday")} />
        <input type="checkbox" hidden {...register("is-worked")} />
        <div className="mt-2 w-full">
          <HolidayChoice
            value={toHolidayValue(isPublicHolidayWatch, isWorkedWatch)}
            onChange={(next) => {
              const { isPublicHoliday, publicHolidayWorked } = fromHolidayValue(next);
              setValue("is-public-holiday", isPublicHoliday);
              setValue("is-worked", publicHolidayWorked);
              setStoreValues({ isPublicHoliday, publicHolidayWorked });
            }}
          />
        </div>
      </Stack>
    </>
  );
}

export default Inputs;
