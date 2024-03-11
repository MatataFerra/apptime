import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

type NotesStore = {
  isNotesOpen: boolean;
  notes: string;
  setNotes: (note: string) => void;
  notesToggle: () => void;
};

export const useNotesStore = createWithEqualityFn(
  devtools<NotesStore>(
    (set, get) => ({
      isNotesOpen: false,
      notes: "",
      setNotes: (note) => {
        // console.log("setNotes", note, "prev", get().notes);
        set({ notes: note }, false, "setNotes");
      },
      notesToggle: () => {
        set((state) => ({
          isNotesOpen: !state.isNotesOpen,
        }));
      },
    }),
    {
      name: "notes",
    }
  ),
  shallow
);
