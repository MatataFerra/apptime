import { useEffect } from "react";

import ShiftService from "@/services/Shift";

import ShiftFinishButton from "@/components/ShiftFinishButton";
import ShiftStartDialog from "@/components/ShiftStartDialog";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftButtons() {
  const { user, updateShiftStatus } = useShiftStateContext((state) => state);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const buttonStatus = useButtonStatus();

  useEffect(() => {
    if (!shiftUnclosed) return;
    updateShiftStatus(!shiftUnclosed?.isClosed);
  }, [shiftUnclosed, updateShiftStatus]);

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <ShiftStartDialog triggerStatus={buttonStatus?.startButton} />
      <ShiftFinishButton buttonStatus={buttonStatus.finishButton} />
    </Stack>
  );
}

export default ShiftButtons;
