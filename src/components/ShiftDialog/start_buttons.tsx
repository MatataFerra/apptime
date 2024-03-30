"use client";

import { Shift } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { DialogClose } from "../ui/Dialog";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type SuccessShiftResponse = {
  message: string;
  response: boolean;
  shift: Shift;
};

function checkData(data: unknown): data is SuccessShiftResponse {
  return typeof data === "object" && data !== null;
}

function DialogButtons() {
  const { user, updateShiftsInfo, updateShiftStatus, createShift, updateShiftUnclosed } =
    useShiftStateContext((state) => state);
  const mutate = useMutation({
    mutationFn: api.createShift.bind(api),
    onSuccess: (data) => {
      if (checkData(data)) {
        createShift({
          ...data.shift,
          id: data?.shift.id,
        });
        updateShiftsInfo();
        updateShiftUnclosed();
      }
    },
  });

  function onStartShift(publicHolidayWorked: boolean) {
    mutate.mutate({
      body: {
        userId: user?.id as string,
        startDate: new Date().toString(),
        isClosed: false,
        amount: 0,
        endDate: null,
        isPublicHoliday: false,
        notes: "",
        publicHolidayWorked,
      },
    });

    updateShiftStatus(true);
  }

  function onSelectOption(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    onStartShift(!!Number(e.currentTarget.dataset.button));
  }

  return (
    <>
      <Stack>
        <DialogClose asChild>
          <Button
            data-button={1}
            type="button"
            variant="gradient_secondary"
            classes="h-12 w-full rounded-lg px-[5px] py-[3px]"
            onClick={onSelectOption}
          >
            <Text
              as="span"
              classes="flex h-full w-full items-center justify-center p-2 text-xs text-black"
            >
              Yes! Money 🤑
            </Text>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            variant="black"
            classes="h-12 w-full text-xs"
            onClick={onSelectOption}
            data-button={0}
          >
            No, regular day
          </Button>
        </DialogClose>
      </Stack>
    </>
  );
}

export default DialogButtons;
