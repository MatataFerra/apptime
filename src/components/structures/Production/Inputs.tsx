"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import { ProductionJobFormCheckDataSchema, type UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";
import type { ProductionInputs } from "@/types/forms";

import { observer } from "@/components/structures/SalaryItems/observer";
import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useGetUniqueSalaryItems from "@/hooks/useGetUniqueSalaryItems";
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
    values: { name },
  } = useProductionForm((state) => state);

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
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useFormContext<ProductionInputs>();

  /*
    observe when the submit is done
  */
  const { setDone } = observer();

  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { names } = useShiftNames(user, watch("name"));

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

  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");
  const itemValueWatch = watch("item-value");
  const itemQuantityWatch = watch("item-quantity");

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

    const previousSalaryItemsData = queryClient.getQueryData<SuccessApiResponse<SalaryItems>>([
      "salary",
    ]);

    //* Optimistic update
    queryClient.cancelQueries({ queryKey: ["salary"] }).then(() => {
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
    queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
      const lastId = previousUserData?.user?.shifts?.production?.at(-1)?.id ?? Math.random();
      const newProduction = [
        ...(previousUserData?.user?.shifts?.production ?? []),
        {
          id: lastId + 1,
          startDate: parseData.startDate,
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

      queryClient.setQueryData(["user", user?.email], {
        ...previousUserData,
        user: {
          ...previousUserData?.user,
          shifts: {
            ...previousUserData?.user.shifts,
            production: newProduction,
          },
        },
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
        queryKey: ["user", user?.email],
      });

      queryClient.invalidateQueries({
        queryKey: ["salary"],
      });

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
              production: previousUserData?.user.shifts?.production,
            },
          },
        });

        return { previousUserData };
      });

      queryClient.cancelQueries({ queryKey: ["salary"] }).then(() => {
        queryClient.setQueryData(["salary"], {
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
            containerClasses="flex-grow"
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
          <DatalistShiftNames data={names} setValue={setValue} value={watch("name")} />
        </Stack>
        <Stack grid cols={2} as="fieldset" classes="w-full">
          <Input
            classes="h-full"
            label="Start date"
            type="datetime-local"
            {...register("start-date", {
              onChange(e) {
                setStoreValues({ startDate: e.target.value });
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
          measure="$"
          description="If you produce boxes, each box costs $0.023"
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
        <Stack orientation="horizontal" wrap classes="mt-4">
          <Stack alignItems="center">
            <input
              className="size-4"
              type="checkbox"
              id="production-holiday"
              {...register("is-public-holiday", {
                onChange(e) {
                  setStoreValues({ isPublicHoliday: e.target.checked });
                },
              })}
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
              {...register("is-worked", {
                onChange(e) {
                  setStoreValues({ publicHolidayWorked: e.target.checked });
                },
              })}
            />
            <Text as="label" htmlFor="production-worked">
              did you work it?
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

export default Inputs;
