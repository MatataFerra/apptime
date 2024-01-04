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
    updateInputsAreDisabled,
    inputsDisabled,
    getShift,
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
    const updateShift = getShift(shift?.id);
    mutate.mutate({
      body: {
        ...updateShift,
        amount: updateShift?.amount,
        endDate: updateShift?.endDate,
        isClosed: true,
        isPublicHoliday: updateShift?.isPublicHoliday,
        notes: updateShift?.notes,
        publicHolidayWorked: updateShift?.publicHolidayWorked,
        startDate: updateShift?.startDate,
        userId: updateShift?.userId,
      },
      id: updateShift?.id,
    });
    updateShiftStatus(false);
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
