import { type DateRange } from "react-day-picker";
import { create } from "zustand";

interface RangeSelectedState {
  isRangeSelected: boolean;
  date: DateRange | undefined;
  setIsRangeSelected: (isRangeSelected: boolean) => void;
  setDate: (date: DateRange | undefined) => void;
}

export const useRangeSelected = create<RangeSelectedState>((set) => ({
  isRangeSelected: false,
  date: {
    from: undefined,
    to: undefined,
  },
  setIsRangeSelected: (isRangeSelected: boolean) => set({ isRangeSelected }),
  setDate: (date: DateRange | undefined) => set({ date }),
}));
