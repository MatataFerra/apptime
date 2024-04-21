"use client";

import { Shift } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import { type TaxCodes } from "@/types";

import Button from "@/components/ui/Button";

import { DialogClose } from "../ui/Dialog";
import { useShiftData } from "@/store/useShiftData";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type SuccessShiftResponse = {
  message: string;
  response: boolean;
  shift: Shift;
};

type Props = {
  title?: string;
};

function checkData(data: unknown): data is SuccessShiftResponse {
  return typeof data === "object" && data !== null;
}

function ShiftStartButton({ title = "Save config & start" }: Props) {
  const { data, errors } = useShiftData((state) => state);
  const { user, updateShiftsInfo, updateShiftStatus, createShift, updateShiftUnclosed } =
    useShiftStateContext((state) => state);
  const mutate = useMutation({
    mutationFn: api.createShift.bind(api),
    onMutate: () => {
      Toast({
        message: "Shift is being created",
        type: "info",
      });
    },
    onSuccess: (data) => {
      if (checkData(data)) {
        createShift({
          ...data.shift,
          id: data?.shift.id,
        });
        updateShiftsInfo();
        updateShiftUnclosed();

        Toast({
          message: "Shift started",
          type: "success",
        });
      }
    },

    onError: () => {
      Toast({
        message: "Error creating shift, please try again",
        type: "error",
      });

      updateShiftStatus(false);
    },
  });

  function onStartShift() {
    mutate.mutate({
      body: {
        userId: user?.id as string,
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
        taxCode: data.taxCode ? (data.taxCode as TaxCodes) : 2,
        unpaidBreaks: Number(data.unpaidBreaks),
        itemQuantity: null,
        itemValue: null,
        typeShift: "TRACK",
      },
    });

    updateShiftStatus(true);
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
