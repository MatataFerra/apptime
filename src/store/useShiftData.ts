import type { Hourly } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const ShiftStep = {
  PublicHoliday: "PublicHoliday",
  ShiftInfo: "ShiftInfo",
  HasConfig: "HasConfig",
} as const;

export type ShiftStep = (typeof ShiftStep)[keyof typeof ShiftStep];

const data = {
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
};

interface ShiftData {
  data: Omit<Hourly, "id">;
  step: ShiftStep;
  errors: boolean;
  setErrors: (errors: boolean) => void;
  setData: (data: Partial<ShiftData["data"]>) => void;
  setStep: (step: ShiftStep) => void;
  resetShiftData: () => void;
}

export const useShiftData = create(
  devtools<ShiftData>(
    (set, get) => ({
      data,
      errors: false,
      step: ShiftStep.HasConfig,
      setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
      setStep: (step) => set((state) => ({ ...state, step })),
      setErrors: (errors) => set((state) => ({ ...state, errors })),
      resetShiftData: () => set((state) => ({ ...state, data })),
    }),
    {
      name: "shiftData",
    }
  )
);
