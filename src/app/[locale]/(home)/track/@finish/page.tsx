"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";

import HourlyService from "@/services/Shift/Hourly";

import Skeleton from "@/components/ui/Skeleton";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

const FinishButton = dynamic(() => import("@/components/structures/Track/Flow/Finish/Button"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});
export default function FinishButtonPage() {
  const { user, updateShiftStatus } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return <FinishButton buttonStatus={buttonStatus.finishButton} />;
}
