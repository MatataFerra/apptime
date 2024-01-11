import { create } from "zustand";
import { devtools } from "zustand/middleware";

type NotesStore = {
  isNotesOpen: boolean;
  isOn: boolean;
  setIsOn: (isOn: boolean) => void;
  setIsNotesOpen: (isNotesOpen: boolean) => void;
};

export const useNotesStore = create(
  devtools<NotesStore>(
    (set, get) => ({
      isOn: false,
      isNotesOpen: false,
      setIsOn: (isOn: boolean) => set({ isOn }),
      setIsNotesOpen: (isNotesOpen: boolean) => set({ isNotesOpen }),
    }),
    {
      name: "notes",
    }
  )
);
