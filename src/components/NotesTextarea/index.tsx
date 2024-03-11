"use client";

import { useEffect, useId, useRef } from "react";

import { useShallow } from "zustand/react/shallow";

import Textarea from "@/components/ui/Textarea";

import { useNotesStore } from "@/store/useNotesStore";

type Props = {};

function NotesTextarea(props: Props) {
  const setNotes = useNotesStore(useShallow((state) => state.setNotes));
  const notes = useNotesStore(useShallow((state) => state.notes));
  const isNotesOpen = useNotesStore(useShallow((state) => state.isNotesOpen));
  const refTextArea = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  useEffect(() => {
    if (isNotesOpen) {
      refTextArea.current?.focus();
    }
  }, [isNotesOpen]);

  return (
    <Textarea
      id={id}
      ref={refTextArea}
      classes="mx-1 h-full rounded-none bg-transparent p-2 text-2xl outline-none"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      {...props}
    />
  );
}

export default NotesTextarea;
