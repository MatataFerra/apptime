"use client";

import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import useTrack from "@/hooks/useTrack";

import onCreateTrackJob from "@/server-actions/create-track";
import { useShiftData } from "@/store/useShiftData";

type Props = {
  title?: string;
};

function ShiftStartButton({ title }: Props) {
  const t = useTranslations("track.start");
  const { data, errors } = useShiftData((state) => state);
  const queryClient = useQueryClient();
  const {
    user,
    updateShiftsInfo,
    updateShiftStatus,
    createShift,
    updateShiftUnclosed,
    setIsClosing,
  } = useTrack();

  function onStartShift() {
    Toast({
      message: t("creating"),
      type: "loading",
    });

    updateShiftStatus(true);

    onCreateTrackJob({
      startDate: new Date().toString(),
      endDate: null,
      name: data.name,
      amount: 0,
      notes: "",
      isClosed: false,
      isPublicHoliday: data.isPublicHoliday,
      publicHolidayWorked: data.publicHolidayWorked,
      holidayRate: null,
      hourValue: Number(data.hourValue),
      unpaidBreaks: Number(data.unpaidBreaks),
      shiftId: user?.shifts?.id as number | null,
      currency: data.currency ?? null,
      employerId: data.employerId ?? null,
      source: "track",
    }).then((response) => {
      if (response?.response) {
        Toast({
          message: t("started"),
          type: "success",
        });

        invalidateShiftQueries(queryClient);

        const prepareShift: Hourly = {
          ...data,
          startDate: new Date().toString(),
          id: response.shift?.id!,
          endDate: null,
          isClosed: false,
        };

        // success response
        createShift({
          ...prepareShift,
        });

        updateShiftsInfo();
        updateShiftUnclosed();
        setIsClosing(false);

        return;
      }

      Toast({
        message: t("error"),
        type: "error",
      });

      updateShiftStatus(false);
      setIsClosing(true);
    });
  }

  return (
    <DialogClose asChild>
      <Button
        variant="accent"
        disabled={errors}
        type="submit"
        classes="w-full text-sm"
        onClick={onStartShift}
      >
        {title ?? t("save_and_start")}
      </Button>
    </DialogClose>
  );
}

export default ShiftStartButton;
