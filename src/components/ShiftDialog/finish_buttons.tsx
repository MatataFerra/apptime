"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/services/Api/Shift";

import DialogClose from "@/components/ShiftDialog/FinishDialogModule/DialogClose";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";
import { useToast } from "@/components/ui/Toast/use-toast";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function FinishDialogButtons() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    getShift,
    buttonClicked,
    setClickOnSave,
    updateShiftsInfo,
    setButtonClicked,
    initialShiftState: { diff: initialDiffState },
    updateShiftStatus,
    updateShiftUnclosed,
    updateInputsAreDisabled,
    updateDifferenceBetweenStartAndEnd,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);

  const mutate = useMutation({
    mutationFn: api.updateShift.bind(api),
    onSuccess: (_) => {
      updateShiftsInfo();
      updateShiftUnclosed();
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Shift updated",
        description: "Your shift has been updated successfully",
        className: "bg-green-400",
        action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
      });
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
    updateInputsAreDisabled(false);
    setButtonClicked({ cancel: true, ok: true, edit: false, moveOn: false });
  }

  function onCancelEdit() {
    updateInputsAreDisabled(true);
    updateDifferenceBetweenStartAndEnd(initialDiffState);
    setClickOnSave(false);
    setButtonClicked({ cancel: false, ok: false, edit: true, moveOn: true });
  }

  function onSaveChanges() {
    updateInputsAreDisabled(true);
    setClickOnSave(true);
    setButtonClicked({ cancel: false, ok: false, edit: true, moveOn: true });
  }

  return (
    <>
      <Stack>
        {buttonClicked.moveOn && <DialogClose onFinishShift={onFinishShift} />}
        {buttonClicked.edit && (
          <Button
            type="button"
            data-button="edit"
            variant="black"
            classes="h-12 w-full text-xs text-white"
            onClick={onEditShift}
          >
            It’s wrong, please edit
          </Button>
        )}

        {buttonClicked.cancel && (
          <Button
            type="button"
            data-button="cancel"
            variant="danger"
            classes="h-12 w-full text-xs text-white"
            onClick={onCancelEdit}
          >
            Cancel
          </Button>
        )}

        {buttonClicked.ok && (
          <Button
            type="button"
            data-button="ok"
            variant="success"
            classes="h-12 w-full text-xs text-black"
            onClick={onSaveChanges}
          >
            Save changes
          </Button>
        )}
      </Stack>
    </>
  );
}

export default FinishDialogButtons;
