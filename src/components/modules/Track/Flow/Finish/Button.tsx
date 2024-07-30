"use client";

import { useEffect } from "react";

import HourlyService from "@/services/Shift/Hourly";

import FinishButton from "@/components/structures/Track/Flow/Finish/Button";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

export default function ButtonFinish() {
  const { user, updateShiftStatus, isShiftActive } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return <>{isShiftActive ? <FinishButton buttonStatus={buttonStatus.finishButton} /> : null}</>;
}
