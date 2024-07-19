import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import { SheetClose } from "@/components/ui/Sheet";
import Stack from "@/components/ui/Stack";

import useTrack from "@/hooks/useTrack";

import { useNotes } from "@/store/useNotesStore";

function Buttons() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useTrack();
  const { notes, setlocalNote, setError, setOpen } = useNotes();

  async function onSaveNotes() {
    if (notes.length <= 3) return setError();
    if (!shift) return;

    updateShift({ notes, id: shift.id });
    setlocalNote(notes);
    setOpen(false);

    Toast({
      message: "Note added",
      type: "plain",
      description: "Your note has been added to the shift.",
      duration: 2000,
    });
  }
  return (
    <Stack orientation="horizontal" justifyContent="end" classes="p-2">
      <SheetClose asChild>
        <Button type="button" variant="danger" size="sm" classes="w-20 select-none">
          Cancel
        </Button>
      </SheetClose>

      <Button
        type="button"
        variant="post-it"
        size="sm"
        classes="w-20 select-none"
        onClick={onSaveNotes}
      >
        Save
      </Button>
    </Stack>
  );
}

export default Buttons;
