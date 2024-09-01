import { create } from "zustand";

type DatalistStore = {
  isWritingName: boolean;
  setIsWriting: (value: boolean) => void;
};

export const useDatalistStore = create<DatalistStore>((set, get) => ({
  isWritingName: false,
  setIsWriting: (value: boolean) =>
    set({
      isWritingName: value,
    }),
}));
