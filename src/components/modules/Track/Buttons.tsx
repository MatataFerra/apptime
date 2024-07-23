"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";

import HourlyService from "@/services/Shift/Hourly";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

const StartDialog = dynamic(() => import("@/components/modules/Track/Flow/Start/Dialog"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

const FinishButton = dynamic(() => import("@/components/structures/Track/Flow/Finish/Button"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

function ShiftButtons() {
  const { user, updateShiftStatus, isShiftActive } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return (
    <Stack classes="h-fit w-full" spacing={10} alignItems="center" justifyContent="between">
      {isShiftActive ? (
        <FinishButton buttonStatus={buttonStatus.finishButton} />
      ) : (
        <StartDialog triggerStatus={buttonStatus?.startButton} />
      )}
    </Stack>
  );
}

export default ShiftButtons;
