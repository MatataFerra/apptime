"use client";

import { useEffect } from "react";

import ShiftService from "@/services/Shift";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";
import FinishButton from "@/components/structures/Track/Flow/Finish/Button";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftButtons() {
  const { user, updateShiftStatus } = useShiftStateContext((state) => state);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <StartDialog triggerStatus={buttonStatus?.startButton} />
      <FinishButton buttonStatus={buttonStatus.finishButton} />
    </Stack>
  );
}

export default ShiftButtons;
