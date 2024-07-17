import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { Tax } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import { ProductionJobFormCheckDataSchema, type UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";
import type { ProductionInputs } from "@/types/forms";

import { observer } from "@/components/structures/Taxes/observer";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useGetUniqueTaxes from "@/hooks/useGetUniqueTaxes";
import useUser from "@/hooks/useUser";

import onCreateProductionShift from "@/server-actions/production-job";
import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesStore } from "@/store/useTaxStore";

function Inputs() {
  /*
    Custom hook to get the values from the form
  */
  const {
    setValues,
    reset: resetValues,
    setIsFormReady,
    setDialogState,
  } = useProductionForm((state) => state);

  /*
    Custom hook to get the taxes from the store
  */
  const { taxes, saveTaxes, clearTaxes, setSaveTaxes } = useProductionTaxesStore((state) => state);

  /*
    Use data and methods from the useForm hook
  */
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useFormContext<ProductionInputs>();

  /*
    observe when the submit is done
  */
  const { setDone } = observer();

  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const getUniqueTaxes = useGetUniqueTaxes({ localTaxes: taxes });

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
      holidayPayRate: parseFloat(formData["holiday-pay-rate"] || "0"),
      itemQuantity: parseFloat(formData["item-quantity"]),
      isPublicHoliday: formData["is-public-holiday"],
      publicHolidayWorked: formData["is-worked"],
      taxes: taxes,
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

    const previousTaxData = queryClient.getQueryData<SuccessApiResponse<Tax[]>>(["tax"]);

    //* Optimistic update
    queryClient.cancelQueries({ queryKey: ["tax"] }).then(() => {
      const prev = previousTaxData?.tax.map((tax) => {
        return {
          ...tax,
        };
      });

      const lastId = prev?.at(-1)?.id ?? Math.random();

      const unique = getUniqueTaxes?.map((tax) => ({
        ...tax,
        id: lastId + 1,
      }));

      const all = prev?.concat(unique ?? []);

      queryClient.setQueryData(["tax"], {
        ...previousTaxData,
        tax: all,
      });

      return { previousTaxData };
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
          holidayPayRate: parseData.holidayPayRate,
          itemValue: parseData.itemValue,
          itemQuantity: parseData.itemQuantity,
          isPublicHoliday: parseData.isPublicHoliday,
          publicHolidayWorked: parseData.publicHolidayWorked,
          holidayPay: parseData.holidayPayRate > 0,
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
          shifts: {
            ...previousUserData?.user.shifts,
            production: newProduction,
          },
        },
      });

      return { previousUserData };
    });

    setDialogState(false);
    setSaveTaxes(false);

    onCreateProductionShift(parseData).then((response) => {
      setDone(true);
      if (response?.response) {
        Toast({
          type: "success",
          message: "Success",
          description: "Shift created successfully",
          duration: 3000,
        });

        resetValues();
        clearTaxes();

        return reset();
      }

      queryClient.invalidateQueries({
        queryKey: ["user", user?.email],
      });

      queryClient.refetchQueries({
        queryKey: ["tax"],
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

      queryClient.cancelQueries({ queryKey: ["tax"] }).then(() => {
        queryClient.setQueryData(["tax"], {
          ...previousTaxData,
          tax: previousTaxData?.tax,
        });

        return { previousTaxData };
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
          {...register("start-date", {
            onChange(e) {
              setValues({ startDate: e.target.value });
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
              setValues({ finishDate: e.target.value });
            },
          })}
        />
        <Input
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
              setValues({ itemValue: e.target.value });
            },
          })}
        />
        <Input
          label="Quantity"
          min={0}
          type="number"
          {...register("item-quantity", {
            onChange(e) {
              setValues({ itemQuantity: e.target.value });
            },
          })}
        />
        <Input
          label="Holiday pay rate"
          min={0}
          measure="%"
          type="number"
          {...register("holiday-pay-rate", {
            onChange(e) {
              setValues({ holidayPayRate: e.target.value });
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
                  setValues({ isPublicHoliday: e.target.checked });
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
                  setValues({ publicHolidayWorked: e.target.checked });
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
