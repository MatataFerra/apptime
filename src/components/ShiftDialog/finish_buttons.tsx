"use client";

import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { DialogClose } from "../ui/Dialog";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function FinishDialogButtons() {
  const {
    updateShiftsInfo,
    updateShiftStatus,
    updateShiftUnclosed,
    updateShift,
    updateInputsAreDisabled,
    inputsDisabled,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);

  const mutate = useMutation({
    mutationFn: api.updateShift.bind(api),
    onSuccess: (_) => {
      updateShiftsInfo();
      updateShiftUnclosed();
    },
  });

  function onFinishShift() {
    updateShift({
      isClosed: true,
      endDate: new Date().toString(),
      id: shift?.id,
    });
    mutate.mutate({
      body: {
        ...shift,
        amount: shift?.amount,
        endDate: new Date().toString(),
        isClosed: true,
        isPublicHoliday: shift?.isPublicHoliday,
        notes: shift?.notes,
        publicHolidayWorked: shift?.publicHolidayWorked,
        startDate: shift?.startDate,
        userId: shift?.userId,
      },
      id: shift?.id,
    });
    updateShiftStatus(true);
  }

  function onEditShift(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    e.currentTarget.dataset.button === "edit"
      ? updateInputsAreDisabled(false)
      : updateInputsAreDisabled(true);
  }

  return (
    <>
      <Stack>
        <DialogClose asChild>
          <Button
            data-button={1}
            type="button"
            variant="gradient"
            classes="h-12 w-full px-[5px] py-[3px]"
            onClick={onFinishShift}
          >
            <Text
              as="span"
              classes="flex h-full w-full items-center justify-center rounded bg-white p-2 text-xs text-black"
            >
              Let&apos;s move on! 🤖
            </Text>
          </Button>
        </DialogClose>

        <Button
          type="button"
          data-button={inputsDisabled ? "edit" : "ok"}
          variant={inputsDisabled ? "black" : "success"}
          classes={`h-12 w-full text-xs transition-all ${
            inputsDisabled ? "text-white" : "text-black"
          }`}
          onClick={onEditShift}
        >
          {inputsDisabled ? "It’s wrong, please edit" : "Maybe not, it's  ok"}
        </Button>
      </Stack>
    </>
  );
}

export default FinishDialogButtons;
