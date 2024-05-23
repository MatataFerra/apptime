"use client";

import FloatingActionButton from "@/components/ui/Fab";

import useStatus from "@/hooks/useStatus";

import { useNotesStore } from "@/store/useNotesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function FabNotes() {
  const { notesToggle } = useNotesStore();
  const { isShiftActive } = useShiftStateContext((state) => state);
  const status = useStatus(isShiftActive);

  return (
    <>
      <FloatingActionButton data-testid="fab-btn" onClick={notesToggle} disabled={!status} />
    </>
  );
}

export default FabNotes;
