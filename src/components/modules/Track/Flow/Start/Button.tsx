"use client";

import { useEffect } from "react";

import HourlyService from "@/services/Shift/Hourly";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

export default function ButtonsStart() {
  const { user, updateShiftStatus, isShiftActive } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return <>{!isShiftActive ? <StartDialog triggerStatus={buttonStatus?.startButton} /> : null}</>;
}
