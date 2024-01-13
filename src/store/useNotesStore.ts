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
          set({ isOn: true });
        } else {
          setTimeout(() => set({ isOn: false }), 1000);
        }

        set({ isNotesOpen: !get().isNotesOpen });
      },
    }),
    {
      name: "notes",
    }
  )
);
