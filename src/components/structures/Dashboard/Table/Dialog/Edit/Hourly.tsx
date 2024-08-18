"use client";

import { useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore } from "date-fns";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";

import type { HourlyType, UserType } from "@/types";

import Footer from "@/components/structures/Dashboard/Table/Dialog/Edit/Footer";
import Taxes from "@/components/structures/Dashboard/Table/Dialog/Edit/Taxes";
import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import onEditShift from "@/server-actions/edit-shift";
import { useTableStore } from "@/store/useTableStore";

type Props = {
  shift: HourlyType;
  user: UserType | null | undefined;
};

type EditShiftHourlyForm = {
  startDate: string;
  endDate: string;
  hourValue: number;
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
  const { taxesToDelete, reset } = useTaxesHandlerDelete((state) => state);

  function onHandleEdit(data: EditShiftHourlyForm) {
    const { startDate, endDate, hourValue, isPublicHoliday, publicHolidayWorked } = data;

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
      isPublicHoliday,
      publicHolidayWorked,
    };

    // Check if user made any changes
    const isShiftEqual = isEqual(shiftUpdated, shift);

    if (isShiftEqual && taxesToDelete.length <= 0) {
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

        queryClient.refetchQueries({ queryKey: ["user", user?.email] });

        setStep("info");
        reset();

        router.refresh();
      } else {
        Toast({
          type: "error",
          message: "Error updating shift, please reload the page and try again.",
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
          <Taxes shift={shift} />
        </Stack>
      </Stack>
      <Footer />
    </Stack>
  );
}

export default TableDialogEditHourly;
