import type { Hourly } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const ShiftStep = {
  PublicHoliday: "PublicHoliday",
  ShiftInfo: "ShiftInfo",
  HasConfig: "HasConfig",
} as const;

export type ShiftStep = (typeof ShiftStep)[keyof typeof ShiftStep];

interface ShiftData {
  data: Omit<Hourly, "id">;
  step: ShiftStep;
  errors: boolean;
  setErrors: (errors: boolean) => void;
  setData: (data: Partial<ShiftData["data"]>) => void;
  setStep: (step: ShiftStep) => void;
}

export const useShiftData = create(
  devtools<ShiftData>(
    (set, get) => ({
      data: {
        name: "",
        hourValue: 0,
        startDate: "",
        isClosed: false,
        amount: 0,
        endDate: null,
        isPublicHoliday: false,
        notes: "",
        publicHolidayWorked: false,
        unpaidBreaks: 0,
        shiftId: null,
        currency: null,
        source: "track",
      },
      errors: false,
      step: ShiftStep.HasConfig,
      setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
      setStep: (step) => set((state) => ({ ...state, step })),
      setErrors: (errors) => set((state) => ({ ...state, errors })),
    }),
    {
      name: "shiftData",
    }
  )
);
