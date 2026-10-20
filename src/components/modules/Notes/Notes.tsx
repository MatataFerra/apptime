"use client";

import type { PropsWithChildren } from "react";

import { StickyNote } from "lucide-react";

import Buttons from "@/components/structures/Notes/Buttons";
import Header from "@/components/structures/Notes/Header";
import Textarea from "@/components/structures/Notes/TextArea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";

import useTrack from "@/hooks/useTrack";

import { useNotes } from "@/store/useNotesStore";

function startedLabel(start?: string | Date | null) {
  if (!start) return null;
  const date = new Date(start);
  if (isNaN(date.valueOf())) return null;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Notes for the running shift. Drops down from the top like a note
 * stuck to the screen, in the warm paper tone of the app.
 */
function Notes({ children }: PropsWithChildren) {
  const { open, setOpen, localNote } = useNotes();
  const {
    shiftUnclosed: { shift },
  } = useTrack();
  const started = startedLabel(shift?.startDate);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="top"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const note = (e.currentTarget as HTMLElement | null)?.querySelector("textarea");
          note?.focus();
          note?.setSelectionRange(note.value.length, note.value.length);
        }}
        className="mx-auto flex max-w-md flex-col gap-4 rounded-b-[28px] border-none bg-fast-soft px-4 pt-[max(env(safe-area-inset-top),1.25rem)] pb-3 [&>button]:hidden"
      >
        <SheetHeader className="flex-row items-center gap-3 space-y-0 text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fast text-on-module">
            <StickyNote className="size-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <SheetTitle className="text-[1.0625rem] font-semibold text-fast-ink">
              Shift notes
            </SheetTitle>
            <SheetDescription className="m-0! truncate text-[0.8125rem] text-fast-ink/75">
              {started ? `Shift started at ${started}` : "Add notes to this shift"}
            </SheetDescription>
          </div>
          {localNote ? (
            <span className="shrink-0 rounded-full bg-surface/70 px-2.5 py-1 text-xs font-semibold text-fast-ink">
              Saved
            </span>
          ) : null}
        </SheetHeader>

        <Header />
        <Textarea />
        <Buttons />

        <span aria-hidden="true" className="mx-auto mt-1 h-1 w-10 rounded-full bg-fast-ink/20" />
      </SheetContent>
    </Sheet>
  );
}

export default Notes;
