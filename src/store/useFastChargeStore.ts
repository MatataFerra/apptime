import { create } from "zustand";

interface FastCharge {
  values: {
    startDate?: string;
    finishDate?: string;
    hourValue?: string;
    holidayPayRate?: string;
    startTime?: string;
    finishTime?: string;
    fastHoliday?: boolean;
    fastWorked?: boolean;
    unpaidBreaks?: string;
  };

  errors: {
    startDate: boolean;
    finishDate: boolean;
    hourValue: boolean;
    holidayPayRate: boolean;
    startTime: boolean;
    finishTime: boolean;
    unpaidBreaks: boolean;
  };

  focus: {
    startDate: boolean;
    finishDate: boolean;
    hourValue: boolean;
    holidayPayRate: boolean;
    startTime: boolean;
    finishTime: boolean;
    unpaidBreaks: boolean;
  };

  setValues: (values: Partial<FastCharge["values"]>) => void;
  setError: (error: keyof FastCharge["errors"], value: boolean) => void;
  setFocus: (focus: keyof FastCharge["focus"], value: boolean) => void;
  reset: () => void;
}

export const useFastChargeStore = create<FastCharge>((set, get) => ({
  values: {
    startDate: "",
    finishDate: "",
    hourValue: "",
    holidayPayRate: "",
    startTime: "",
    finishTime: "",
    fastHoliday: false,
    fastWorked: false,
    unpaidBreaks: "",
  },

  errors: {
    startDate: false,
    finishDate: false,
    hourValue: false,
    holidayPayRate: false,
    startTime: false,
    finishTime: false,
    unpaidBreaks: false,
  },

  focus: {
    startDate: false,
    finishDate: false,
    hourValue: false,
    holidayPayRate: false,
    startTime: false,
    finishTime: false,
    unpaidBreaks: false,
  },

  setValues: (values) => set({ values: { ...get().values, ...values } }),
  setError: (error, value) => set({ errors: { ...get().errors, [error]: value } }),
  setFocus: (focus, value) => set({ focus: { ...get().focus, [focus]: value } }),
  reset: () =>
    set({
      values: {
        startDate: "",
        finishDate: "",
        hourValue: "",
        holidayPayRate: "",
        startTime: "",
        finishTime: "",
        fastHoliday: false,
        fastWorked: false,
        unpaidBreaks: "",
      },
    }),
}));
