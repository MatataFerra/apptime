import type { DateRange } from "react-day-picker";

import { isSameDay, isWithinInterval } from "date-fns";
import { create } from "zustand";

import type { HourlyType } from "@/types";

interface DashHourlyState {
  initialHourlies: HourlyType[] | null;
  hourly: HourlyType[] | null;
  setInitialHourlies: (hourlies: HourlyType[]) => void;
  delete: (id: number) => void;
  update: (hourly: Partial<HourlyType>) => void;
  reset: () => void;
  filterByDate: (date: DateRange | undefined) => void;
}

export const useDashHourlyStore = create<DashHourlyState>((set, get) => ({
  initialHourlies: null,
  hourly: null,
  setInitialHourlies: (hourlies: HourlyType[]) =>
    set({
      ...get(),
      initialHourlies: hourlies,
      hourly: hourlies,
    }),

  delete: (id: number) =>
    set({
      ...get(),
      hourly: get().hourly?.filter((hourly) => hourly.id === id),
    }),

  update: (hourly: Partial<HourlyType>) =>
    set({
      ...get(),
      hourly: get().hourly?.map((shift) => {
        if (shift.id === hourly.id) {
          return {
            ...shift,
            ...hourly,
          };
        }

        return shift;
      }),
    }),

  reset: () =>
    set({
      ...get(),
      hourly: get().initialHourlies,
    }),

  filterByDate: (date) => {
    const initial = get().initialHourlies;

    const hourly = initial?.filter((shift) => {
      if (!date?.from) return false;
      if (!date?.to) return false;

      const startAndEndAreSame = isSameDay(new Date(date?.from), new Date(date?.to));
      const startAndGivenDateAreSame = isSameDay(new Date(shift.startDate), new Date(date?.from));
      const endAndGivenDateAreSame = isSameDay(new Date(shift.startDate), new Date(date?.to));

      if (startAndEndAreSame && startAndGivenDateAreSame) return true;

      if (startAndGivenDateAreSame || endAndGivenDateAreSame) return true;

      return isWithinInterval(new Date(shift.startDate), {
        start: new Date(date?.from),
        end: new Date(date?.to),
      });
    });

    return set((state) => {
      return {
        ...state,
        hourly,
      };
    });
  },
}));
