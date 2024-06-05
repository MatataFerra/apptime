import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import { ProductionJobFormCheckDataSchema } from "@/types";
import type { ProductionInputs } from "@/types/forms";

import AccordionTaxes from "@/components/structures/Taxes/AccordionTaxes";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

import onSubmitProductionJob from "@/server-actions/production-job";
import { useProductionForm } from "@/store/useProductionForm";
import { useProductionTaxesStore } from "@/store/useTaxStore";

function Inputs() {
  const {
    setValues,
    reset: resetValues,
    setIsFormReady,
    setDialogState,
  } = useProductionForm((state) => state);
  const { taxes, saveTaxes, clearTaxes, setSaveTaxes, addTax, removeTax } = useProductionTaxesStore(
    (state) => state
  );

  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useFormContext<ProductionInputs>();

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

    const checkData = ProductionJobFormCheckDataSchema.safeParse(data);

    if (checkData.success) {
      setIsFormReady(true);
    } else {
      setIsFormReady(false);
    }
  }, [finishDateWatch, itemQuantityWatch, itemValueWatch, setIsFormReady, startDateWatch]);

  function onSubmit(formData: ProductionInputs) {
    const parseData = {
      startDate: new Date(formData["start-date"]).toString(),
      endDate: new Date(formData["finish-date"]).toString(),
      itemValue: parseFloat(formData["item-value"]),
      holidayPayRate: parseFloat(formData["holiday-pay-rate"]),
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

    onSubmitProductionJob(parseData).then((response) => {
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

        resetValues();
        clearTaxes();
        setDialogState(false);

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
          label="Item value"
          type="number"
          step={"any"}
          measure="$"
          measurePlace="left"
          {...register("item-value", {
            onChange(e) {
              setValues({ itemValue: e.target.value });
            },
          })}
        />
        <Input
          label="Quantity"
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
        <Stack classes="my-8 w-full">
          <AccordionTaxes
            addTax={addTax}
            taxes={taxes}
            clearTaxes={clearTaxes}
            emptyTableText="Not taxes yet"
            setSaveTaxes={setSaveTaxes}
            removeTax={removeTax}
          />
        </Stack>
      </Stack>
    </>
  );
}

export default Inputs;
