"use client";

import { useCallback, useEffect } from "react";

import ut from "@/services/Utilities/client";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";

import useButtonStatus from "@/hooks/useButtonStatus";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useTrack from "@/hooks/useTrack";

export default function ButtonsStart() {
  const { isShiftActive, updateShiftStatus } = useTrack();
  const { shiftUnclosed } = useHourlyShifts();
  const buttonStatus = useButtonStatus();

  const checkCloseShift = useCallback(() => {
    if (typeof shiftUnclosed?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shiftUnclosed?.isClosed);
  }, [shiftUnclosed?.isClosed]);

  useEffect(() => {
    updateShiftStatus(checkCloseShift());
  }, [checkCloseShift, updateShiftStatus]);

  return <>{!isShiftActive ? <StartDialog triggerStatus={buttonStatus?.startButton} /> : null}</>;
}
