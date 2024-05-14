"use client";

import { useForm } from "react-hook-form";

import { Shift } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore } from "date-fns";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";

import { UserType } from "@/types";

import Button from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import onEditShift from "@/server-actions/edit-shift";
import { useTableStore } from "@/store/useTableStore";

type Props = {
  shift: Shift;
  user: UserType | null | undefined;
};

type EditProductionShiftForm = {
  startDate: string;
  endDate: string;
  itemValue: number;
  itemQuantity: number;
  holidayPayRate: number;
  isPublicHoliday: boolean;
  publicHolidayWorked: boolean;
};

function TableDialogEditProduction({ shift, user }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditProductionShiftForm>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setStep } = useTableStore((state) => state);

  function onHandleEdit(data: EditProductionShiftForm) {
    const {
      startDate,
      endDate,
      itemValue,
      holidayPayRate,
      isPublicHoliday,
      publicHolidayWorked,
      itemQuantity,
    } = data;

    const shiftUpdated = {
      ...shift,
      startDate: new Date(startDate).toString(),
      endDate: new Date(endDate).toString(),
      itemValue: Number(itemValue),
      itemQuantity: Number(itemQuantity),
      holidayPayRate: Number(holidayPayRate),
      isPublicHoliday,
      publicHolidayWorked,
    };

    // Check if user made any changes
    const isShiftEqual = isEqual(shiftUpdated, shift);

    if (isShiftEqual) {
      Toast({
        type: "error",
        message: "No changes were made.",
        duration: 1000,
      });

      return;
    }

    if (isBefore(new Date(endDate), new Date(startDate))) {
      setError("endDate", {
        message: "Finish date must be after start date",
      });

      Toast({
        type: "error",
        message: "Please check the dates and try again.",
        duration: 1000,
      });

      return;
    }

    onEditShift(shiftUpdated).then((res) => {
      if (res) {
        Toast({
          type: "success",
          message: "Shift updated successfully!",
          duration: 2000,
        });
        queryClient.invalidateQueries({ queryKey: ["user", user?.email] });
        setStep("info");
        router.refresh();
      } else {
        Toast({
          type: "error",
          message: "Error updating shift, please try again.",
          duration: 2000,
        });
      }
    });
  }

  return (
    <Stack as="form" orientation="horizontal" wrap onSubmit={handleSubmit(onHandleEdit)}>
      <Input
        type="datetime-local"
        label="Start Date"
        {...register("startDate", { value: format(shift.startDate, "yyyy-MM-dd'T'HH:mm") })}
      />
      <Input
        type="datetime-local"
        label="End Date"
        isError={!!errors["endDate"]}
        description={errors["endDate"]?.message}
        {...register("endDate", {
          value: format(shift.endDate!, "yyyy-MM-dd'T'HH:mm"),
        })}
      />
      <Input
        type="number"
        label="Item Value"
        step={"any"}
        placeholder={shift?.itemValue?.toString()}
        {...register("itemValue", {
          value: shift?.itemValue ?? 0,
        })}
      />
      <Input
        type="number"
        label="Item Quantity"
        placeholder={shift?.itemQuantity?.toString()}
        {...register("itemQuantity", {
          value: shift.itemQuantity ?? 0,
        })}
      />
      <Input
        type="number"
        label="Holiday Pay Rate"
        measure="%"
        placeholder={shift.holidayPayRate?.toString()}
        {...register("holidayPayRate", {
          value: shift.holidayPayRate ?? 0,
        })}
      />
      <Stack orientation="horizontal" wrap>
        <Stack alignItems="center">
          <input
            className="size-4"
            type="checkbox"
            id="isPublicHoliday"
            {...register("isPublicHoliday", { value: shift.isPublicHoliday })}
          />
          <Text as="label" htmlFor="isPublicHoliday">
            is it a public holiday?
          </Text>
        </Stack>
        <Stack alignItems="center">
          <input
            className="size-4"
            type="checkbox"
            id="publicHolidayWorked"
            {...register("publicHolidayWorked", { value: shift.publicHolidayWorked })}
          />
          <Text as="label" htmlFor="publicHolidayWorked">
            Have you worked it?
          </Text>
        </Stack>
      </Stack>
      <DialogFooter className="flex w-full flex-row items-center justify-end gap-4">
        <Button
          type="button"
          size="sm"
          variant="white"
          classes="active:shadow-button-inner"
          onClick={() => setStep("info")}
        >
          back
        </Button>
        <Button type="submit" size="sm" variant="success">
          Save
        </Button>
      </DialogFooter>
    </Stack>
  );
}

export default TableDialogEditProduction;
