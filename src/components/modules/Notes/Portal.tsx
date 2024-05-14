"use client";

import Content from "@/components/structures/Notes/Content";
import Textarea from "@/components/structures/Notes/TextArea";
import Portal from "@/components/ui/Portal";
import Stack from "@/components/ui/Stack";

import useDelayed from "@/hooks/useDelayed";

import { useNotesStore } from "@/store/useNotesStore";

function NotesPortal() {
  const { notesToggle, isNotesOpen } = useNotesStore((state) => state);
  const isNotesOpenDelayed = useDelayed(isNotesOpen, 500);

  return (
    <>
      <Portal
        data-testid="modal-test"
        id="notes"
        isOn={isNotesOpenDelayed}
        classes={
          isNotesOpen
            ? "[&>section]:animate-fade-down"
            : "[&>section]:animate-dissapear-up [&>section]:transition-all"
        }
      >
        {isNotesOpen && (
          <Stack
            as="div"
            classes={`absolute top-0 h-svh w-full animate-backdrop-blurry bg-[#80808033] transition-all`}
            onClick={notesToggle}
          />
        )}
        <Content>
          <Textarea />
        </Content>
      </Portal>
    </>
  );
}

export default NotesPortal;
