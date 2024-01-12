import { Shift } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ShiftStore {
  currentShift: Shift | null;
  setCurrentShift: (shift: Partial<Shift>) => void;
}

export const useShiftStore = create<ShiftStore>((set, get) => ({
  currentShift: null,
  setCurrentShift: (shift) => {
    const currentShift = get().currentShift || {
      id: 0,
      startDate: "",
      endDate: null,
      amount: null,
      isPublicHoliday: false,
      publicHolidayWorked: false,
      isClosed: false,
      notes: null,
      userId: null,
    };
    set({ currentShift: { ...currentShift, ...shift } });
  },
}));
