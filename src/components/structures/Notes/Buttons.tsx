import { useEffect } from "react";

import { useLocalStorage } from "usehooks-ts";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import useTrack from "@/hooks/useTrack";

import { useNotesStore } from "@/store/useNotesStore";

function Buttons() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useTrack();
  const { notesToggle, notes, setNotes } = useNotesStore((state) => state);
  const [value, setValue, removeValue] = useLocalStorage("notes", notes);

  useEffect(() => {
    if (window !== undefined) {
      if (!notes.length && value) setNotes(value);
      if (!value) removeValue();
    }
  }, [notes, removeValue, setNotes, value]);

  async function onSaveNotes() {
    if (notes.length <= 3) return;
    if (!shift) return;

    updateShift({ notes, id: shift.id });
    setValue(notes);

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
