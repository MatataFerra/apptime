"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore } from "date-fns";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";
import ut from "@/services/Utilities/client";

import type { HourlyType, UserType } from "@/types";

import Footer from "@/components/structures/Dashboard/Table/Dialog/Edit/Footer";
import Taxes from "@/components/structures/Dashboard/Table/Dialog/Edit/Taxes";
import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import Input from "@/components/ui/Input";

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
  name: string;
};

function TableDialogEditHourly({ shift, user }: Props) {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditShiftHourlyForm>();
  const isPublicHoliday = useWatch({
    control,
    name: "isPublicHoliday",
    defaultValue: shift.isPublicHoliday,
  });
  const publicHolidayWorked = useWatch({
    control,
    name: "publicHolidayWorked",
    defaultValue: shift.publicHolidayWorked,
  });
  const router = useRouter();
  const t = useTranslations("dashboard.edit");
  const ts = useTranslations("shift");
  const queryClient = useQueryClient();
  const { setStep } = useTableStore((state) => state);
  const [employerId, setEmployerId] = useState(shift.employerId ?? null);
  const { taxesToDelete, rateChanges, reset } = useTaxesHandlerDelete((state) => state);

  function onHandleEdit(data: EditShiftHourlyForm) {
    const { startDate, endDate, hourValue, isPublicHoliday, publicHolidayWorked, name } = data;

    if (isBefore(new Date(endDate), new Date(startDate))) {
      setError("endDate", {
        message: ts("errors.finish_before_start"),
      });

      Toast({
        type: "error",
        message: t("check_dates"),
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
      name,
      employerId,
    };

    // Check if user made any changes
    const isShiftEqual = isEqual(shiftUpdated, shift);

    if (isShiftEqual && taxesToDelete.length <= 0 && rateChanges.length <= 0) {
      Toast({
        type: "error",
        message: t("no_changes"),
        duration: 1000,
      });

      return;
    }

    onEditShift(shiftUpdated, taxesToDelete, rateChanges).then(async (res) => {
      Toast({
        type: "loading",
        message: t("updating"),
        duration: Infinity,
      });

      await ut.delay(1500);

      if (res) {
        Toast({
          type: "success",
          message: t("updated"),
          duration: 2000,
        });

        queryClient.refetchQueries({ queryKey: ["user", user?.email] });
        // A rate change can add a tax and changes the shift totals.
        queryClient.invalidateQueries({ queryKey: ["salary"] });
        queryClient.invalidateQueries({ queryKey: ["hourly"] });
        queryClient.invalidateQueries({ queryKey: ["production"] });

        setStep("info");
        reset();

        router.refresh();
      } else {
        Toast({
          type: "error",
          message: t("update_failed"),
          duration: 2000,
        });
      }
    });
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onHandleEdit)}>
      <Input
        type="text"
        label={ts("fields.job")}
        {...register("name", { value: shift?.name ?? "" })}
      />

      <Input
        type="datetime-local"
        label={ts("fields.start")}
        {...register("startDate", { value: format(shift.startDate, "yyyy-MM-dd'T'HH:mm") })}
      />
      <Input
        type="datetime-local"
        label={ts("fields.finish")}
        isError={!!errors["endDate"]}
        description={errors["endDate"]?.message}
        {...register("endDate", {
          value: format(shift.endDate!, "yyyy-MM-dd'T'HH:mm"),
        })}
      />
      <Input
        type="number"
        label={ts("fields.hourly_rate")}
        step="0.01"
        min={0}
        placeholder={shift.hourValue.toString()}
        {...register("hourValue", {
          value: shift.hourValue,
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
      <EmployerSelect
        value={employerId}
        onChange={(employer) => setEmployerId(employer?.id ?? null)}
        classes="mt-0 mb-0"
      />
      <HolidayChoice
        value={toHolidayValue(isPublicHoliday, publicHolidayWorked)}
        onChange={(next) => {
          const { isPublicHoliday, publicHolidayWorked } = fromHolidayValue(next);
          setValue("isPublicHoliday", isPublicHoliday, { shouldDirty: true });
          setValue("publicHolidayWorked", publicHolidayWorked, { shouldDirty: true });
        }}
      />
      {shift.taxes?.length ? (
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-sm font-medium text-ink">{ts("review.taxes")}</h3>
          <Taxes shift={shift} />
        </div>
      ) : null}
      <Footer />
    </form>
  );
}

export default TableDialogEditHourly;
