"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";

import HourlyService from "@/services/Shift/Hourly";

import Skeleton from "@/components/ui/Skeleton";

import useButtonStatus from "@/hooks/useButtonStatus";
import useTrack from "@/hooks/useTrack";

const StartDialog = dynamic(() => import("@/components/modules/Track/Flow/Start/Dialog"), {
  ssr: false,
  loading: () => <Skeleton classes="h-18 w-full" />,
});

export default function ButtonsPage() {
  const { user, updateShiftStatus, isShiftActive } = useTrack();
  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return <>{isShiftActive ? null : <StartDialog triggerStatus={buttonStatus?.startButton} />}</>;
}
