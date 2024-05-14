import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { isBefore } from "date-fns";

import Toast from "@/services/Toast";

import { ProductionJobFormSchema } from "@/types";
import { type ProductionInputs } from "@/types/forms";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

import onSubmitProductionJob from "@/server-actions/production-job";
import { useProductionForm } from "@/store/useProductionForm";

function Inputs() {
  const { setValues } = useProductionForm((state) => state);
  const queryClient = useQueryClient();
  const { data: user } = useUser();
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

  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");

  function onSubmit(formData: ProductionInputs) {
    const parseData = {
      startDate: new Date(formData["start-date"]).toString(),
      endDate: new Date(formData["finish-date"]).toString(),
      itemValue: parseFloat(formData["item-value"]),
      holidayPayRate: parseFloat(formData["holiday-pay-rate"]),
      itemQuantity: parseFloat(formData["item-quantity"]),
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
      duration: 1000,
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
        <Stack orientation="horizontal" wrap>
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
