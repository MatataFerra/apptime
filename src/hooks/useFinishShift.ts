import { useState } from "react";

import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import useTrack from "@/hooks/useTrack";

import onUpdateTrackJob from "@/server-actions/update-track";
import { useNotes } from "@/store/useNotesStore";
import { useShiftData } from "@/store/useShiftData";
import { useTrackTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

/**
 * Closes the running tracked shift: the Finish button in Track and the
 * live-shift card on Home both use it, so they save exactly the same thing
 * (name, taxes added during the shift, end time set on the server).
 */
function useFinishShift() {
  const queryClient = useQueryClient();
  const { removelocalNote } = useNotes();
  const editedName = useShiftData((state) => state.data.name);
  const {
    taxesModule: { salaryElement: taxes },
    contributionsModule: { salaryElement: contributions },
  } = useTrackTaxesOrContributionsStore();
  const {
    user,
    updateShiftsInfo,
    updateShiftStatus,
    updateShiftUnclosed,
    updateShift,
    setIsClosing,
  } = useTrack();
  const [finishing, setFinishing] = useState(false);

  async function finish(shift: Partial<Hourly> | null | undefined) {
    if (!shift?.id || finishing) return false;

    setFinishing(true);
    setIsClosing(true);
    Toast({ message: "Closing shift", type: "loading", description: "Saving your hours…" });

    const prepared = {
      ...shift,
      name: editedName || shift.name || null,
      shiftId: shift.shiftId ?? user?.shifts?.id ?? null,
    };
    const closed = new ShiftService({ ...prepared, isClosed: true })
      .closeShift()
      .differenceInMinsBetweenStartAndEnd()
      .checkPublicHoliday()
      .build<Hourly>();

    // Optimistic: the Track monitor flips to "off the clock" right away.
    updateShift({ ...closed });
    updateShiftStatus(false);

    const response = await onUpdateTrackJob({ ...closed, taxes, contributions }, shift.id);

    updateShiftsInfo();
    updateShiftUnclosed();
    invalidateShiftQueries(queryClient);
    setFinishing(false);

    if (response) {
      removelocalNote();
      Toast({
        message: "Shift saved",
        type: "success",
        description: "Nice work, it's in your history.",
      });
      return true;
    }

    updateShift({ ...prepared });
    updateShiftStatus(true);
    setIsClosing(false);
    Toast({
      message: "Couldn't finish the shift",
      type: "error",
      description: "Please try again.",
    });
    return false;
  }

  return { finish, finishing };
}

export default useFinishShift;
