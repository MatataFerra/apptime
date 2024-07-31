"use client";

import { useCallback, useEffect } from "react";

import ut from "@/services/Utilities/client";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

export default function ButtonsStart() {
  const {
    isShiftActive,
    updateShiftStatus,
    shiftUnclosed: { shift },
  } = useTrack();
  const buttonStatus = useButtonStatus();
  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  useEffect(() => {
    updateShiftStatus(checkCloseShift());
  }, [checkCloseShift, updateShiftStatus]);

  return <>{!isShiftActive ? <StartDialog triggerStatus={buttonStatus?.startButton} /> : null}</>;
}
