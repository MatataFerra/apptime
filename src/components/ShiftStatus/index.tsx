"use client";

import UnfilledForm from "@/components/ShiftStatus/UnfilledForm";
import ShiftTrack from "@/components/ShiftTrack";
import Stack from "@/components/ui/Stack";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftStatus() {
  const user = useShiftStateContext((state) => state.user);
  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="border_dash min-h-[25dvh] w-full justify-center p-4"
      spacing={6}
      justifyContent="center"
    >
      {!user?.formCompleted ? <UnfilledForm /> : <ShiftTrack />}

      {/* <ShiftTrack /> */}
      {/* <ShiftRecorded /> */}
    </Stack>
  );
}

export default ShiftStatus;
