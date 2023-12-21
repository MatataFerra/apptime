"use client";

import { useEffect } from "react";

import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";
import ShiftService from "@/services/Shift";

import StartShiftDialog from "@/components/Dialogs/StartShiftDialog";
import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftButtons() {
  const { user, updateShift, updateShiftsInfo, updateShiftStatus } = useShiftStateContext(
    (state) => state
  );
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const buttonStatus = useButtonStatus();
  const mutate = useMutation({
    mutationFn: api.updateShift.bind(api),
    onSuccess: (_) => {
      updateShiftsInfo();
    },
  });

  useEffect(() => {
    updateShiftStatus(shiftUnclosed?.isClosed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFinishShift() {
    updateShift({
      isClosed: true,
      endDate: new Date().toString(),
      id: shiftUnclosed?.id,
    });

    mutate.mutate({
      body: {
        ...shiftUnclosed,
      },
      id: shiftUnclosed?.id,
    });
    updateShiftStatus(true);
  }

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <StartShiftDialog triggerStatus={buttonStatus?.startButton} />

      <Button
        classes={`remove_button_highlight w-full shadow-button ${
          buttonStatus?.finishButton.apply_variant ? "active:shadow-button-inner" : ""
        }`}
        variant={buttonStatus?.finishButton.apply_variant ? "danger" : "disabled"}
        disabled={buttonStatus?.finishButton.disabled}
        aria-disabled={buttonStatus?.finishButton.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </Stack>
  );
}

export default ShiftButtons;
