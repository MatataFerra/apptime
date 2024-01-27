import { create } from "zustand";
import { devtools } from "zustand/middleware";

type NotesStore = {
  isNotesOpen: boolean;
  notesToggle: () => void;
};

export const useNotesStore = create(
  devtools<NotesStore>(
    (set) => ({
      isNotesOpen: false,
      notesToggle: () => {
        set((state) => ({
          isNotesOpen: !state.isNotesOpen,
        }));
      },
    }),
    {
      name: "notes",
    }
  )
);
