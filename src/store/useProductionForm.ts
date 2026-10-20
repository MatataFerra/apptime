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
    name?: string;
    /** null: the Settings currency */
    currency?: string | null;
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

  isFormReady: boolean;
  dialog: boolean;
  formError: boolean;

  setValues: (values: Partial<Production["values"]>) => void;
  setError: (error: keyof Production["errors"], value: boolean) => void;
  setFocus: (focus: keyof Production["focus"], value: boolean) => void;
  reset: () => void;

  setIsFormReady: (value: boolean) => void;
  setDialogState: (value: boolean) => void;
  setFormError: (value: boolean) => void;
}

export const useProductionForm = create<Production>((set, get) => ({
  values: {
    startDate: "",
    finishDate: "",
    name: "",
    itemValue: "",
    itemQuantity: "",
    holidayPayRate: "",
    startTime: "",
    finishTime: "",
    isPublicHoliday: false,
    publicHolidayWorked: false,
    unpaidBreaks: "",
    currency: null,
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

  isFormReady: false,
  dialog: false,
  formError: false,

  setValues: (values) => set({ values: { ...get().values, ...values } }),
  setError: (error, value) => set({ errors: { ...get().errors, [error]: value } }),
  setFocus: (focus, value) => set({ focus: { ...get().focus, [focus]: value } }),
  reset: () =>
    set({
      values: {
        startDate: "",
        finishDate: "",
        name: "",
        holidayPayRate: "",
        isPublicHoliday: false,
        itemQuantity: "",
        itemValue: "",
        publicHolidayWorked: false,
        unpaidBreaks: "",
      },
      isFormReady: false,
    }),

  setIsFormReady: (value) => set({ isFormReady: value }),
  setDialogState: (value) => set({ dialog: value }),
  setFormError: (value) => set({ formError: value }),
}));
