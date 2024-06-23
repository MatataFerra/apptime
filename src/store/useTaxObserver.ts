import { create } from "zustand";

interface ObserverProps {
  done: boolean;
  setDone: (value: boolean) => void;
}

export const useTaxObserver = create<ObserverProps>((set) => ({
  done: false,
  setDone: (value) => set({ done: value }),
}));
