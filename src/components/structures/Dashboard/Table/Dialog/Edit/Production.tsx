"use client";

import { useForm } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore } from "date-fns";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";
import ut from "@/services/Utilities/client";

import type { ProductionType, UserType } from "@/types";

import Footer from "@/components/structures/Dashboard/Table/Dialog/Edit/Footer";
import Taxes from "@/components/structures/Dashboard/Table/Dialog/Edit/Taxes";
import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import Input from "@/components/ui/Input";

import onEditShift from "@/server-actions/edit-shift";
import { useTableStore } from "@/store/useTableStore";

type Props = {
  shift: ProductionType;
  user: UserType | null | undefined;
};

type EditProductionShiftForm = {
  startDate: string;
  endDate: string;
  name: string;
  itemValue: number;
  itemQuantity: number;
  isPublicHoliday: boolean;
  publicHolidayWorked: boolean;
};

function TableDialogEditProduction({ shift, user }: Props) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditProductionShiftForm>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setStep } = useTableStore((state) => state);
  const { taxesToDelete, reset } = useTaxesHandlerDelete((state) => state);

  function onHandleEdit(data: EditProductionShiftForm) {
    const {
      startDate,
      endDate,
      itemValue,
      isPublicHoliday,
      publicHolidayWorked,
      itemQuantity,
      name,
    } = data;

    const shiftUpdated = {
      ...shift,
      startDate: new Date(startDate).toString(),
      endDate: new Date(endDate).toString(),
      itemValue: Number(itemValue),
      itemQuantity: Number(itemQuantity),
      isPublicHoliday,
      publicHolidayWorked,
      name,
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

    onEditShift(shiftUpdated, taxesToDelete).then(async (res) => {
      Toast({
        type: "info",
        message: "Shift is being updated",
        duration: Infinity,
      });

      await ut.delay(1500);

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
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onHandleEdit)}>
      <Input type="text" label="Job name" {...register("name", { value: shift?.name ?? "" })} />
      <Input
        type="datetime-local"
        label="Start"
        {...register("startDate", { value: format(shift.startDate, "yyyy-MM-dd'T'HH:mm") })}
      />
      <Input
        type="datetime-local"
        label="Finish"
        isError={!!errors["endDate"]}
        description={errors["endDate"]?.message}
        {...register("endDate", {
          value: format(shift.endDate!, "yyyy-MM-dd'T'HH:mm"),
        })}
      />
      <Input
        type="number"
        label="Pay per piece"
        step={"any"}
        placeholder={shift?.itemValue?.toString()}
        {...register("itemValue", {
          value: shift?.itemValue ?? 0,
        })}
      />
      <Input
        type="number"
        label="Pieces"
        placeholder={shift?.itemQuantity?.toString()}
        {...register("itemQuantity", {
          value: shift.itemQuantity ?? 0,
        })}
      />
      <input
        type="checkbox"
        hidden
        {...register("isPublicHoliday", { value: shift.isPublicHoliday })}
      />
      <input
        type="checkbox"
        hidden
        {...register("publicHolidayWorked", { value: shift.publicHolidayWorked })}
      />
      <HolidayChoice
        value={toHolidayValue(watch("isPublicHoliday"), watch("publicHolidayWorked"))}
        onChange={(next) => {
          const { isPublicHoliday, publicHolidayWorked } = fromHolidayValue(next);
          setValue("isPublicHoliday", isPublicHoliday, { shouldDirty: true });
          setValue("publicHolidayWorked", publicHolidayWorked, { shouldDirty: true });
        }}
      />
      {shift.taxes?.length ? (
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-sm font-medium text-ink">Taxes</h3>
          <Taxes shift={shift} />
        </div>
      ) : null}
      <Footer />
    </form>
  );
}

export default TableDialogEditProduction;
