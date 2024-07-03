"use client";

import type { Hourly } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

import useTrack from "@/hooks/useTrack";

import { useShiftData } from "@/store/useShiftData";

type SuccessShiftResponse = {
  message: string;
  response: boolean;
  shift: Hourly;
};

type Props = {
  title?: string;
};

function checkData(data: unknown): data is SuccessShiftResponse {
  return typeof data === "object" && data !== null;
}

function ShiftStartButton({ title = "Save config & start" }: Props) {
  const { data, errors } = useShiftData((state) => state);
  const mock: Hourly = Object.freeze({
    id: Math.random(),
    ...data,
  });
  const { user, updateShiftsInfo, updateShiftStatus, createShift, updateShiftUnclosed, getShift } =
    useTrack();
  const mutate = useMutation({
    mutationFn: api.createHourly.bind(api),
    onMutate: () => {
      Toast({
        message: "Shift is being created",
        type: "info",
      });
    },
    onSuccess: (data) => {
      if (checkData(data)) {
        if (!data.response) {
          Toast({
            message: "Error creating shift, please try again",
            type: "error",
          });
          updateShiftStatus(false);
          return;
        }

        const updateShift = getShift(mock.id);
        const prepareShift = {
          ...updateShift,
          ...data.shift,
        };

        // success response
        createShift({
          ...prepareShift,
        });
        updateShiftsInfo();
        updateShiftUnclosed();

        Toast({
          message: "Shift started",
          type: "success",
        });
      }
    },
  });

  function onStartShift() {
    updateShiftStatus(true);
    createShift({
      ...mock,
    });
    mutate.mutate({
      body: {
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
      },
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
