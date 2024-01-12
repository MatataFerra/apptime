"use client";

import useStatus from "@/hooks/useStatus";

import FloatingActionButton from "../ui/Fab";
import { useNotesStore } from "@/store/useNotesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function FabNotes() {
  const { notesToggle } = useNotesStore();
  const { isShiftActive } = useShiftStateContext((state) => state);
  const status = useStatus(isShiftActive);

  return (
    <>
      <FloatingActionButton onClick={notesToggle} disabled={!status} />
    </>
  );
}

export default FabNotes;
