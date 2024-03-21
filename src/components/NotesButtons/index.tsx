import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import { useNotesStore } from "@/store/useNotesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function NotesButtons() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);
  const { notesToggle, notes } = useNotesStore((state) => state);

  async function onSaveNotes() {
    if (notes.length <= 3) return;
    if (!shift) return;

    await api.updateShift({ body: { ...shift, notes }, id: shift.id });
    updateShift({ notes, id: shift.id });

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

export default NotesButtons;
