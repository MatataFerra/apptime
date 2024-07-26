"use client";

import { useForm } from "react-hook-form";

import { Hourly, Production } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore } from "date-fns";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";

import type { HourlyType, UserType } from "@/types";

import Button from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useTaxesHandlerDelete } from "../store/taxesHandlerDelete";
import onEditShift from "@/server-actions/edit-shift";
import { useTableStore } from "@/store/useTableStore";

type Props = {
  shift: Hourly;
  user: UserType | null | undefined;
};

type EditShiftHourlyForm = {
  startDate: string;
  endDate: string;
  hourValue: number;
  holidayPayRate: number;
  isPublicHoliday: boolean;
  publicHolidayWorked: boolean;
};

function TableDialogEditHourly({ shift, user }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditShiftHourlyForm>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setStep } = useTableStore((state) => state);
  const { taxesToDelete, addTaxToDelete } = useTaxesHandlerDelete((state) => state);

  function onHandleEdit(data: EditShiftHourlyForm) {
    const { startDate, endDate, hourValue, holidayPayRate, isPublicHoliday, publicHolidayWorked } =
      data;

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

    const shiftUpdated = {
      ...shift,
      startDate: new Date(startDate).toString(),
      endDate: new Date(endDate).toString(),
      hourValue: Number(hourValue),
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

    onEditShift(shiftUpdated, taxesToDelete).then((res) => {
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
        label="Hour Value"
        placeholder={shift.hourValue.toString()}
        {...register("hourValue", {
          value: shift.hourValue,
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
        <Stack
          orientation="vertical"
          classes="h-40 w-full overflow-y-scroll rounded-md p-2 shadow-md"
          spacing={4}
        >
          <Text classes="font-semibold">Remove wrong taxes:</Text>
          <div className="grid grid-cols-2 gap-4 gap-y-8">
            {/* {shift.taxes?.map((tax) => (
              <div key={tax.id} className="flex items-center gap-4">
                <article className="flex gap-1 text-balance text-sm">
                  <p>
                    {tax.name} {tax.value}%
                  </p>
                  {!!tax.description ? <p className="line-clamp-1">({tax.description})</p> : null}
                </article>
                <Button
                  type="button"
                  variant="outlined"
                  size="xs"
                  classes="cursor-pointer border border-red-400 text-gray-900 transition-colors active:bg-red-200 active:shadow-button-inner"
                  onClick={() => {
                    addTaxToDelete(tax);
                    Toast({
                      type: "info",
                      message: "Tax will be deleted",
                      description: "Please press save to delete it",
                      duration: 1500,
                      classes: "text-gray-900",
                    });
                  }}
                >
                  delete
                </Button>
              </div>
            ))} */}
          </div>
        </Stack>
      </Stack>
      <DialogFooter className="mt-2 flex w-full flex-row items-center justify-end gap-4">
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

export default TableDialogEditHourly;
