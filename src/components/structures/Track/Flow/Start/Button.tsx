"use client";

import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useTrack from "@/hooks/useTrack";
import useUser from "@/hooks/useUser";

import onCreateTrackJob from "@/server-actions/create-track";
import { useShiftData } from "@/store/useShiftData";

type Props = {
  title?: string;
};

function ShiftStartButton({ title = "Save config & start" }: Props) {
  const { data, errors } = useShiftData((state) => state);
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { updateShiftsInfo, updateShiftStatus, createShift, updateShiftUnclosed, setIsClosing } =
    useTrack();

  function onStartShift() {
    Toast({
      message: "Shift is being created",
      type: "info",
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
      hourValue: Number(data.hourValue),
      unpaidBreaks: Number(data.unpaidBreaks),
      shiftId: user?.shifts?.id as number | null,
    }).then((response) => {
      if (response?.response) {
        Toast({
          message: "Shift started",
          type: "success",
        });

        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.USER, user?.email] });

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
        message: "Error creating shift, please try again",
        type: "error",
      });

      updateShiftStatus(false);
      setIsClosing(true);
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
