import type { DateRange } from "react-day-picker";

import { isSameDay, isWithinInterval } from "date-fns";
import { create } from "zustand";

import type { ProductionType } from "@/types";

interface DashProductionState {
  initialProductions: ProductionType[] | null;
  productions: ProductionType[] | null;
  setInitialProductions: (hourlies: ProductionType[]) => void;
  delete: (id: number) => void;
  update: (productions: Partial<ProductionType>) => void;
  reset: () => void;
  filterByDate: (date: DateRange | undefined) => void;
}

export const useDashProductionStore = create<DashProductionState>((set, get) => ({
  initialProductions: null,
  productions: null,
  setInitialProductions: (productions: ProductionType[]) =>
    set({
      ...get(),
      initialProductions: productions,
      productions: productions,
    }),

  delete: (id: number) =>
    set({
      ...get(),
      productions: get().productions?.filter((p) => p.id !== id),
    }),

  update: (production: Partial<ProductionType>) =>
    set({
      ...get(),
      productions: get().productions?.map((shift) => {
        if (shift.id === production.id) {
          return {
            ...shift,
            ...production,
          };
        }

        return shift;
      }),
    }),

  reset: () =>
    set({
      ...get(),
      productions: get().initialProductions,
    }),

  filterByDate: (date) => {
    const initial = get().initialProductions;

    const production = initial?.filter((shift) => {
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

    return set((state) => ({
      ...state,
      productions: production,
    }));
  },
}));
