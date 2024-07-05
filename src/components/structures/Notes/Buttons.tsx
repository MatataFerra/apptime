import { useEffect } from "react";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import useTrack from "@/hooks/useTrack";

import { useNotes } from "@/store/useNotesStore";

function Buttons() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useTrack();
  const { notesToggle, notes, setNotes, localNote, setlocalNote, removelocalNote } = useNotes();

  useEffect(() => {
    if (!notes.length && localNote) setNotes(localNote);
    if (!localNote) removelocalNote();
  }, [localNote, notes, removelocalNote, setNotes]);

  async function onSaveNotes() {
    if (notes.length <= 3) return;
    if (!shift) return;

    updateShift({ notes, id: shift.id });
    setlocalNote(notes);

    Toast({
      message: "Note added",
      type: "plain",
      description: "Your note has been added to the shift.",
      duration: 2000,
    });

    notesToggle();
  }
  return (
    <Stack orientation="horizontal" justifyContent="end" classes="p-2">
      <Button type="button" variant="danger" classes="w-28 select-none p-2" onClick={notesToggle}>
        Cancel
      </Button>
      <Button type="button" variant="post-it" classes="w-28 select-none p-2" onClick={onSaveNotes}>
        Save
      </Button>
    </Stack>
  );
}

export default Buttons;
