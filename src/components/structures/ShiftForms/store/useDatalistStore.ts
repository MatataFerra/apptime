import { create } from "zustand";

type DatalistStore = {
  /**
   * The name field whose suggestions are open, if any. Keyed because the
   * single and the several-days forms are mounted together (the hidden tab
   * stays mounted): a shared flag let one form's list close the other's.
   */
  writing: string | null;
  setWriting: (field: string | null) => void;
};

export const useDatalistStore = create<DatalistStore>((set) => ({
  writing: null,
  setWriting: (field) => set({ writing: field }),
}));
