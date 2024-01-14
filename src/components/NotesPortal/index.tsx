"use client";

import { useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Portal from "@/components/ui/Portal/";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast/use-toast";

import { cn } from "@/utils/helpers/styleMerger";

import { useNotesStore } from "@/store/useNotesStore";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

function NotesPortal() {
  const {
    updateShift,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);
  const [note, setNote] = useState(shift?.notes ?? "");
  const { toast } = useToast();
  const { notesToggle, isOn, isNotesOpen } = useNotesStore();

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
    <>
      <Portal data-testid="modal-test" isOn={isOn} isNotesOpen={isNotesOpen}>
        {isNotesOpen && (
          <Stack
            as="div"
            classes={`animate-backdrop-blurry absolute top-0 h-svh w-full bg-[#80808033] transition-all`}
            onClick={notesToggle}
          />
        )}
        <Stack
          classes={cn(
            "absolute top-0 h-52 w-full rounded-lg bg-white p-4 shadow-lg",
            "grid grid-cols-1 grid-rows-[auto,1fr] gap-2 rounded-none bg-yellow-400 p-0"
          )}
        >
          <Stack classes="m-1 bg-yellow-200 p-2" orientation="vertical">
            <Stack as="header">
              <Text>
                New note on Shift{" "}
                {`${new Date(shift?.startDate ?? Date.now()).toLocaleDateString()}`}
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
            <Button
              type="button"
              variant="danger"
              classes="w-28 select-none p-2"
              onClick={notesToggle}
            >
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
        </Stack>
      </Portal>
    </>
  );
}

export default NotesPortal;
