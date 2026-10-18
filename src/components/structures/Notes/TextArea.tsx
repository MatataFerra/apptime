"use client";

import { useId } from "react";

import Textarea from "@/components/ui/Textarea";

import { cn } from "@/utils/helpers/styleMerger";

import { useNotes } from "@/store/useNotesStore";

export const NOTE_MIN_LENGTH = 4;
const NOTE_MAX_LENGTH = 500;

function NotesTextarea() {
  const { error, setError, notes, setNotes } = useNotes();
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fast-ink">
        Note
      </label>
      <Textarea
        id={id}
        rows={5}
        maxLength={NOTE_MAX_LENGTH}
        aria-invalid={error}
        aria-describedby={hintId}
        placeholder="Breaks you took, overtime, who you worked with…"
        classes={cn(
          "min-h-32 w-full resize-none rounded-2xl border bg-surface px-3.5 py-3 text-base leading-relaxed text-ink outline-hidden transition-colors placeholder:text-ink-subtle focus:border-fast",
          error ? "border-destructive" : "border-fast-ink/15"
        )}
        value={notes}
        onChange={(e) => {
          if (error) setError();
          setNotes(e.target.value);
        }}
      />
      <div id={hintId} className="flex justify-between gap-3 text-xs">
        <span className={error ? "font-medium text-destructive" : "text-fast-ink/70"}>
          {error ? `Write at least ${NOTE_MIN_LENGTH} characters` : "Only you can see this."}
        </span>
        <span className="text-fast-ink/60 tabular-nums">
          {notes.length}/{NOTE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}

export default NotesTextarea;
