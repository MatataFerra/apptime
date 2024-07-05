import { useLocalStorage } from "usehooks-ts";
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

export function useNotes() {
  const { notes, ...rest } = useNotesStore((state) => state);
  const [localNote, setlocalNote, removelocalNote] = useLocalStorage("notes", notes);

  return {
    notes,
    localNote,
    setlocalNote,
    removelocalNote,
    ...rest,
  };
}
