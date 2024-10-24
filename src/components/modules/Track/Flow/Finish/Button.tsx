"use client";

import isEmpty from "lodash/isEmpty";

import FinishButton from "@/components/structures/Track/Flow/Finish/Button";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrackShift from "@/hooks/useTrackShift";

export default function ButtonFinish() {
  const { data } = useTrackShift();
  const buttonStatus = useButtonStatus();

  return (
    <>{!isEmpty(data?.shift) ? <FinishButton buttonStatus={buttonStatus.finishButton} /> : null}</>
  );
}
