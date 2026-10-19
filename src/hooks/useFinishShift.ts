"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import type { HourlyType } from "@/types";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import { useTrackStore } from "@/hooks/useTrack";

import onUpdateTrackJob from "@/server-actions/update-track";
import { useNotes } from "@/store/useNotesStore";
import { useShiftData } from "@/store/useShiftData";
import { useTrackTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

/**
 * Closes the running tracked shift from anywhere (Home), the same way the
 * Track screen does: now as the end, with the job name, note and taxes
 * picked while it ran.
 */
function useFinishShift() {
  const queryClient = useQueryClient();
  const { localNote, removelocalNote } = useNotes();
  const editedName = useShiftData((state) => state.data.name);
  const { taxesModule, contributionsModule } = useTrackTaxesOrContributionsStore();
  const [finishing, setFinishing] = useState(false);

  async function finish(running: HourlyType) {
    setFinishing(true);
    try {
      const response = await onUpdateTrackJob(
        {
          ...running,
          name: editedName || running.name,
          notes: localNote || running.notes,
          taxes: taxesModule.salaryElement,
          contributions: contributionsModule.salaryElement,
        } as Parameters<typeof onUpdateTrackJob>[0],
        running.id
      );

      if (!response) throw new Error("Shift not closed");

      removelocalNote();
      taxesModule.clear();
      contributionsModule.clear();
      useTrackStore.getState().updateShiftStatus(false);
      Toast({ type: "success", message: "Shift finished", description: "It's in your dashboard." });
    } catch {
      Toast({ type: "error", message: "Couldn't finish the shift", description: "Try again from Track." });
    } finally {
      await invalidateShiftQueries(queryClient);
      setFinishing(false);
    }
  }

  return { finish, finishing };
}

export default useFinishShift;
