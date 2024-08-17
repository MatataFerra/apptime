import { create } from "zustand";

interface Observer {
  done: boolean;
  setDone: (value: boolean) => void;
}

export const observer = create<Observer>((set) => ({
  done: false,
  setDone: (value) => set({ done: value }),
}));
