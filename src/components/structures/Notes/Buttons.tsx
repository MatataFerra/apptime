import Toast from "@/services/Toast";

import { NOTE_MIN_LENGTH } from "@/components/structures/Notes/TextArea";
import Button from "@/components/ui/Button";
import { SheetClose } from "@/components/ui/Sheet";

import useTrack from "@/hooks/useTrack";

import { useNotes } from "@/store/useNotesStore";

function Buttons() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useTrack();
  const { notes, error, setlocalNote, setError, setOpen } = useNotes();

  function onSaveNotes() {
    if (notes.trim().length < NOTE_MIN_LENGTH) {
      if (!error) setError();
      return;
    }
    if (!shift) return;

    updateShift({ notes, id: shift.id });
    setlocalNote(notes);
    setOpen(false);

    Toast({
      message: "Note saved",
      type: "success",
      description: "It's attached to this shift.",
      duration: 2000,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <SheetClose asChild>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          classes="w-full text-fast-ink hover:bg-fast-ink/10"
        >
          Cancel
        </Button>
      </SheetClose>
      <Button type="button" variant="primary" size="lg" classes="w-full" onClick={onSaveNotes}>
        Save note
      </Button>
    </div>
  );
}

export default Buttons;
