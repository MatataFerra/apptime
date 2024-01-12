"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Portal from "@/components/ui/Portal/";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast/use-toast";

import { useNotesStore } from "@/store/useNotesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function NotesPortal() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);
  const [note, setNote] = useState(shift?.notes ?? "");
  const { toast } = useToast();
  const { notesToggle } = useNotesStore();

  // const dateHumanize = useMemo(() => {
  //   if (!shiftOpen) return;
  //   return new DateHumanizer("today").humanizeDate(new Date(shiftOpen?.startDate));
  // }, [shiftOpen]);

  function onSaveNotes() {
    if (note.length <= 3) return;
    if (!shift) return;

    updateShift({ notes: note, id: shift.id });

    toast({
      title: "Note added",
      description: "Your note has been added to the shift.",
      duration: 2000,
    });

    notesToggle();
  }

  return (
    <Portal classes="grid grid-cols-1 grid-rows-[auto,1fr] gap-2 rounded-none bg-yellow-400 p-0">
      <Stack classes="m-1 bg-yellow-200 p-2" orientation="vertical">
        <Stack as="header">
          <Text>
            New note on Shift {`${new Date(shift?.startDate ?? Date.now()).toLocaleDateString()}`}
          </Text>
        </Stack>
      </Stack>
      <textarea
        className="mx-1 h-full rounded-none bg-transparent p-2 text-2xl outline-none"
        onChange={(e) => {
          setNote(e.target.value);
        }}
        value={note}
      />
      <Stack orientation="horizontal" justifyContent="end" classes="p-2">
        <Button type="button" variant="danger" classes="w-28 select-none p-2" onClick={notesToggle}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="post-it"
          classes="w-28 select-none p-2"
          onClick={onSaveNotes}
        >
          Save
        </Button>
      </Stack>
    </Portal>
  );
}

export default NotesPortal;
