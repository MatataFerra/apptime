import { type DateRange } from "react-day-picker";

import { create } from "zustand";

interface RangeSelectedState {
  isRangeSelected: boolean;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  resetRange: () => void;
  setIsRangeSelected: (isRangeSelected: boolean) => void;
}

export const useRangeSelected = create<RangeSelectedState>((set) => ({
  isRangeSelected: false,
  date: {
    from: undefined,
    to: undefined,
  },
  setDate: (date: DateRange | undefined) => set({ date }),
  resetRange: () => set({ date: { from: undefined, to: undefined } }),
  setIsRangeSelected: (isRangeSelected: boolean) => set({ isRangeSelected }),
}));
