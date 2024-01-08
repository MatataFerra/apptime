"use client";

import { useEffect } from "react";

import ShiftService from "@/services/Shift";

import StartShiftDialog from "@/components/Dialogs/StartShiftDialog";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";

import FinishShiftDialog from "../Dialogs/FinishShiftDialog";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftButtons() {
  const { user, updateShiftStatus } = useShiftStateContext((state) => state);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    updateShiftStatus(shiftUnclosed?.isClosed);
  }, [shiftUnclosed?.isClosed, updateShiftStatus]);

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <StartShiftDialog triggerStatus={buttonStatus?.startButton} />
      <FinishShiftDialog triggerStatus={buttonStatus?.finishButton} />
    </Stack>
  );
}

export default ShiftButtons;
