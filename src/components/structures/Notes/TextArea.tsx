"use client";

import { useId } from "react";

import Textarea from "@/components/ui/Textarea";

import { useNotes } from "@/store/useNotesStore";

type Props = {};

function NotesTextarea(props: Props) {
  const { error, setError, notes, setNotes } = useNotes();
  const id = useId();

  return (
    <Textarea
      id={id}
      classes={`h-full w-[97%] resize-none rounded-sm bg-transparent p-2 text-lg shadow-sm outline-none ${error ? "ring-2 ring-red-700" : "ring-2 ring-transparent"}`}
      value={notes}
      onChange={(e) => {
        if (error) setError();

        return setNotes(e.target.value);
      }}
      {...props}
    />
  );
}

export default NotesTextarea;
