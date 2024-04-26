import { create } from "zustand";

interface Production {
  values: {
    startDate?: string;
    finishDate?: string;
    itemValue?: string;
    itemQuantity?: string;
    holidayPayRate?: string;
    isPublicHoliday?: boolean;
    publicHolidayWorked?: boolean;
    unpaidBreaks?: string;
  };

  errors: {
    startDate: boolean;
    finishDate: boolean;
    itemValue: boolean;
    itemQuantity: boolean;
    holidayPayRate: boolean;
    startTime: boolean;
    finishTime: boolean;
    unpaidBreaks: boolean;
  };

  focus: {
    startDate: boolean;
    finishDate: boolean;
    itemValue: boolean;
    itemQuantity: boolean;
    holidayPayRate: boolean;
    startTime: boolean;
    finishTime: boolean;
    unpaidBreaks: boolean;
  };

  setValues: (values: Partial<Production["values"]>) => void;
  setError: (error: keyof Production["errors"], value: boolean) => void;
  setFocus: (focus: keyof Production["focus"], value: boolean) => void;
}

export const useProductionForm = create<Production>((set, get) => ({
  values: {
    startDate: "",
    finishDate: "",
    itemValue: "",
    itemQuantity: "",
    holidayPayRate: "",
    startTime: "",
    finishTime: "",
    isPublicHoliday: false,
    publicHolidayWorked: false,
    unpaidBreaks: "",
  },

  errors: {
    startDate: false,
    finishDate: false,
    itemValue: false,
    itemQuantity: false,
    holidayPayRate: false,
    startTime: false,
    finishTime: false,
    unpaidBreaks: false,
  },

  focus: {
    startDate: false,
    finishDate: false,
    itemValue: false,
    itemQuantity: false,
    holidayPayRate: false,
    startTime: false,
    finishTime: false,
    unpaidBreaks: false,
  },

  setValues: (values) => set({ values: { ...get().values, ...values } }),
  setError: (error, value) => set({ errors: { ...get().errors, [error]: value } }),
  setFocus: (focus, value) => set({ focus: { ...get().focus, [focus]: value } }),
}));
