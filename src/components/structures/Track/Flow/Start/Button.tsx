"use client";

import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import type { UserType } from "@/types";

import { cancelTrackQuery, optimisticStartTrack } from "@/components/structures/Track/optimistic";
import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

import useTrack from "@/hooks/useTrack";

import onCreateTrackJob from "@/server-actions/create-track";
import { useShiftData } from "@/store/useShiftData";

type Props = {
  title?: string;
};

function ShiftStartButton({ title = "Save config & start" }: Props) {
  const { data, errors } = useShiftData((state) => state);
  const queryClient = useQueryClient();
  const {
    user,
    updateShiftsInfo,
    updateShiftStatus,
    createShift,
    updateShiftUnclosed,
    getShift,
    deleteShift,
  } = useTrack();

  const mock: Hourly = Object.freeze({
    id: Math.random(),
    ...data,
  });

  function onStartShift() {
    Toast({
      message: "Shift is being created",
      type: "info",
    });

    updateShiftStatus(true);
    createShift({
      ...mock,
    });

    optimisticStartTrack(mock, user as UserType, queryClient);

    onCreateTrackJob({
      startDate: new Date().toString(),
      isClosed: false,
      amount: 0,
      endDate: null,
      isPublicHoliday: data.isPublicHoliday,
      notes: "",
      publicHolidayWorked: data.publicHolidayWorked,
      hourValue: Number(data.hourValue),
      holidayPay: data.holidayPay ?? false,
      holidayPayRate: Number(data.holidayPayRate),
      unpaidBreaks: Number(data.unpaidBreaks),
      shiftId: user?.shifts?.id as number | null,
    }).then((response) => {
      if (response?.response) {
        Toast({
          message: "Shift started",
          type: "success",
        });

        queryClient.invalidateQueries({ queryKey: ["user", user?.email] });

        const updateShift = getShift(mock.id)!;
        const prepareShift = {
          ...updateShift,
          ...response.shift,
        };

        // success response
        createShift({
          ...prepareShift,
        });
        updateShiftsInfo();
        updateShiftUnclosed();

        return;
      }

      Toast({
        message: "Error creating shift, please try again",
        type: "error",
      });
      updateShiftStatus(false);
      deleteShift(mock.id);

      cancelTrackQuery(user as UserType, queryClient);
    });
  }

  return (
    <DialogClose asChild>
      <Button
        variant="black"
        disabled={errors}
        type="submit"
        classes="w-full border border-transparent p-2 text-sm"
        onClick={onStartShift}
      >
        {title}
      </Button>
    </DialogClose>
  );
}

export default ShiftStartButton;
