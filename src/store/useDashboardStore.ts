import { createContext, useContext } from "react";
import { type DateRange } from "react-day-picker";

import { isWithinInterval } from "date-fns";
import { create, useStore } from "zustand";

import type { UserType } from "@/types";

interface DashboardStateProps {
  user: UserType | null | undefined;
  initialShifts: UserType["shifts"] | undefined;
}

interface DashboardState extends DashboardStateProps {
  update: (props: Partial<DashboardStateProps["user"]>) => void;
  deleteShift: (id: number) => void;
  filterByDate: (date: DateRange | undefined) => void;
  resetShifts: () => void;
}

type DashboardStateStore = ReturnType<typeof createDashboardStore>;

export function createDashboardStore(initProps?: Partial<DashboardStateProps>) {
  const DEFAULT_PROPS: DashboardStateProps = {
    user: initProps?.user || null,
    initialShifts: initProps?.initialShifts || initProps?.user?.shifts,
  };
  return create<DashboardState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    update: (props) => {
      set({ ...get(), ...props });
    },
    deleteShift: (id) => {
      const hourly = get().user?.shifts?.hourly.filter((shift) => shift.id !== id);
      const production = get().user?.shifts?.production.filter((shift) => shift.id !== id);

      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: {
              id: get().user?.shifts?.id ?? 0,
              userId: get().user?.shifts?.userId ?? "",
              hourly: hourly ?? [],
              production: production ?? [],
            },
          },
          initialShifts: {
            id: get().initialShifts?.id ?? 0,
            userId: get().initialShifts?.userId ?? "",
            hourly: hourly ?? [],
            production: production ?? [],
          },
        });
      }
    },
    filterByDate: (date) => {
      const initial = get().initialShifts;
      const production = initial?.production?.filter((shift) => {
        if (!date?.from) return false;
        if (!date?.to) return false;

        return isWithinInterval(new Date(shift.startDate), {
          start: new Date(date?.from),
          end: new Date(date?.to),
        });
      });
      const hourly = initial?.hourly?.filter((shift) => {
        if (!date?.from) return false;
        if (!date?.to) return false;

        return isWithinInterval(new Date(shift.startDate), {
          start: new Date(date?.from),
          end: new Date(date?.to),
        });
      });

      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: {
              id: get().user?.shifts?.id ?? 0,
              userId: get().user?.shifts?.userId ?? "",
              hourly: hourly ?? [],
              production: production ?? [],
            },
          },
        });
      }
    },
    resetShifts: () => {
      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: {
              id: get().user?.shifts?.id ?? 0,
              userId: get().user?.shifts?.userId ?? "",
              hourly: get().initialShifts?.hourly ?? [],
              production: get().initialShifts?.production ?? [],
            },
          },
        });
      }
    },
  }));
}

export const DashboardContext = createContext<DashboardStateStore | null>(null);

export function useDashboardContext<T>(selector: (state: DashboardState) => T): T {
  const store = useContext(DashboardContext);
  if (!store) throw new Error("Missing DashboardContext.Provider in the tree");
  return useStore(store, selector);
}
