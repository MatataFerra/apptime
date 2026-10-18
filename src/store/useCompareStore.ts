import { create } from "zustand";

interface Compare {
  production: {
    itemValue?: string;
    itemQuantity?: string;
  };
  hourly: {
    hourlyWage?: string;
    /** whole hours worked */
    hoursWorked: string;
    minutesWorked?: string;
  };
  isComparing: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsComparing: (isComparing: boolean) => void;
  setProduction: (data: { itemValue?: string; itemQuantity?: string }) => void;
  setHourly: (data: { hourlyWage?: string; hoursWorked?: string; minutesWorked?: string }) => void;
  reset: () => void;
}

export const useCompareStore = create<Compare>((set) => ({
  production: {
    itemValue: "",
    itemQuantity: "",
  },
  hourly: {
    hourlyWage: "",
    hoursWorked: "",
    minutesWorked: "",
  },
  isComparing: false,
  isLoading: false,
  setProduction: (data) => set((state) => ({ production: { ...state.production, ...data } })),
  setHourly: (data) => set((state) => ({ hourly: { ...state.hourly, ...data } })),
  setIsComparing: (isComparing) => set({ isComparing }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      production: {
        itemValue: "",
        itemQuantity: "",
      },
      hourly: {
        hourlyWage: "",
        hoursWorked: "",
        minutesWorked: "",
      },
      isComparing: false,
      isLoading: false,
    }),
}));
