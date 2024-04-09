import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { type TaxCodes } from "@/types";

const ShiftStep = {
  PublicHoliday: "PublicHoliday",
  ShiftInfo: "ShiftInfo",
} as const;

export type ShiftStep = (typeof ShiftStep)[keyof typeof ShiftStep];

interface ShiftData {
  data: {
    hourValue: number;
    userId: string;
    startDate: string;
    isClosed: boolean;
    amount: number;
    endDate: null;
    isPublicHoliday: boolean;
    notes: string;
    publicHolidayWorked: boolean;
    holidayPay: boolean;
    holidayPayRate: number;
    taxCode?: TaxCodes;
    unpaidBreaks: number;
  };

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
        hourValue: 27,
        userId: "",
        startDate: new Date().toString(),
        isClosed: false,
        amount: 0,
        endDate: null,
        isPublicHoliday: false,
        notes: "",
        publicHolidayWorked: false,
        holidayPay: true,
        holidayPayRate: 8,
        taxCode: 0,
        unpaidBreaks: 1,
      },
      errors: false,
      step: ShiftStep.PublicHoliday,
      setData: (data) => set((state) => ({ ...state, data: { ...state.data, ...data } })),
      setStep: (step) => set((state) => ({ ...state, step })),
      setErrors: (errors) => set((state) => ({ ...state, errors })),
    }),
    {
      name: "shiftData",
    }
  )
);
