"use client";

import FinishButton from "@/components/structures/Track/Flow/Finish/Button";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

export default function ButtonFinish() {
  const { isShiftActive } = useTrack();
  const buttonStatus = useButtonStatus();

  return <>{isShiftActive ? <FinishButton buttonStatus={buttonStatus.finishButton} /> : null}</>;
}
