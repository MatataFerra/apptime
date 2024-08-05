"use client";

import type { PropsWithChildren } from "react";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import Buttons from "@/components/structures/Notes/Buttons";
import Header from "@/components/structures/Notes/Header";
import Textarea from "@/components/structures/Notes/TextArea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";

import { useNotes } from "@/store/useNotesStore";

type Props = {};

function Notes({ children }: PropsWithChildren<Props>) {
  const { open, setOpen } = useNotes();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="top" className="border-none bg-yellow-400 p-0 [&>button]:top-3">
        <SheetHeader className="bg-yellow-200 p-2">
          <SheetTitle>
            <Header />
          </SheetTitle>
          <SheetDescription className="!m-0">
            <VisuallyHidden.Root>Add notes to this shift</VisuallyHidden.Root>
          </SheetDescription>
        </SheetHeader>
        <div className="mx-auto my-2 flex w-full justify-center">
          <Textarea />
        </div>
        <SheetFooter>
          <Buttons />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default Notes;
