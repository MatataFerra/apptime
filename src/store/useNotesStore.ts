import { create } from "zustand";
import { devtools } from "zustand/middleware";

type NotesStore = {
  isNotesOpen: boolean;
  isOn: boolean;
  notesToggle: () => void;
};

export const useNotesStore = create(
  devtools<NotesStore>(
    (set, get) => ({
      isOn: false,
      isNotesOpen: false,
      notesToggle: () => {
        if (!get().isOn) {
          set({ isOn: true }, false, "IS_ON_TOGGLE");
        } else {
          setTimeout(() => set({ isOn: false }, false, "IS_OFF_TOGGLE"), 300);
        }

        set({ isNotesOpen: !get().isNotesOpen }, false, "NOTES_TOGGLE");
      },
    }),
    {
      name: "notes",
    }
  )
);
