import { useEffect } from "react";

import { useLocalStorage } from "usehooks-ts";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type NotesStore = {
  open: boolean;
  notes: string;
  error: boolean;
  setError: () => void;
  setNotes: (note: string) => void;
  setOpen: (value: boolean) => void;
  resetStoreNotes: () => void;
};

export const useNotesStore = create(
  devtools<NotesStore>(
    (set, get) => ({
      open: false,
      notes: "",
      error: false,
      setError: () => {
        set({ error: !get().error });
      },
      setNotes: (note) => {
        set({ notes: note }, false, "setNotes");
      },
      setOpen: (value) => {
        set({ open: value });
      },
      resetStoreNotes: () => {
        set({ notes: "" });
      },
    }),
    {
      name: "notes",
    }
  )
);

/**
 * Custom hook to use the notes store.
 * @returns The notes store and its actions.
 */
export function useNotes() {
  const { notes, ...rest } = useNotesStore((state) => state);
  const [localNote, setlocalNote, removelocalNote] = useLocalStorage("notes", notes);

  useEffect(() => {
    if (!notes.length && localNote) rest.setNotes(localNote);
    if (!localNote) removelocalNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    notes,
    localNote,
    setlocalNote,
    removelocalNote,
    ...rest,
  };
}
