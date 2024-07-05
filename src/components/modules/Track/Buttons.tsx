"use client";

import { useEffect } from "react";

import HourlyService from "@/services/Shift/Hourly";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";
import FinishButton from "@/components/structures/Track/Flow/Finish/Button";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

function ShiftButtons() {
  const { user, updateShiftStatus } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return (
    <Stack classes="h-fit w-full" spacing={10} alignItems="center" justifyContent="between">
      <StartDialog triggerStatus={buttonStatus?.startButton} />
      <FinishButton buttonStatus={buttonStatus.finishButton} />
    </Stack>
  );
}

export default ShiftButtons;
