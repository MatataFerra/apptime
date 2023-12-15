"use client";

import ShiftService from "@/services/Shift";

import ShiftInfo from "@/components/ShiftInfo";
import ShiftTrackTitle from "@/components/ShiftTrackTitle";
import Stack from "@/components/ui/Stack";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTrack() {
  const user = useShiftStateContext((state) => state.user);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts || []);

  return (
    <>
      <Stack
        orientation="vertical"
        classes="h-full w-full self-start"
        alignItems="start"
        justifyContent="between"
      >
        <ShiftTrackTitle shift={shiftUnclosed} />
        <ShiftInfo shifts={user?.shifts} profile={user?.profile} />
      </Stack>
    </>
  );
}

export default ShiftTrack;
