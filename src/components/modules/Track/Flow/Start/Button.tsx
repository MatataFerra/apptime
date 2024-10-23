"use client";

import { useCallback, useEffect } from "react";

import isEmpty from "lodash/isEmpty";

import ut from "@/services/Utilities/client";

import StartDialog from "@/components/modules/Track/Flow/Start/Dialog";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";
import useTrackShift from "@/hooks/useTrackShift";

export default function ButtonsStart() {
  const { updateShiftStatus } = useTrack();
  const { data: track } = useTrackShift();
  const buttonStatus = useButtonStatus();

  const checkCloseShift = useCallback(() => {
    if (typeof track?.shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(track?.shift?.isClosed);
  }, [track?.shift?.isClosed]);

  useEffect(() => {
    updateShiftStatus(checkCloseShift());
  }, [checkCloseShift, updateShiftStatus]);

  return (
    <>{isEmpty(track?.shift) ? <StartDialog triggerStatus={buttonStatus?.startButton} /> : null}</>
  );
}
