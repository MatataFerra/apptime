import { createContext, useContext } from "react";

import { isSameDay } from "date-fns";
import { create, useStore } from "zustand";

import type { UserType } from "@/types";

interface DashboardStateProps {
  user: UserType | null | undefined;
  initialShifts: UserType["shifts"];
}

interface DashboardState extends DashboardStateProps {
  update: (props: Partial<DashboardStateProps["user"]>) => void;
  deleteShift: (id: number) => void;
  filterByDate: (date: string) => void;
  resetShifts: () => void;
}

type DashboardStateStore = ReturnType<typeof createDashboardStore>;

export function createDashboardStore(initProps?: Partial<DashboardStateProps>) {
  const DEFAULT_PROPS: DashboardStateProps = {
    user: initProps?.user || null,
    initialShifts: initProps?.initialShifts || initProps?.user?.shifts || [],
  };
  return create<DashboardState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    update: (props) => {
      set({ ...get(), ...props });
    },
    deleteShift: (id) => {
      const newShifts = get().user?.shifts.filter((shift) => shift.id !== id);

      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: newShifts ?? [],
          },
          initialShifts: newShifts ?? [],
        });
      }
    },
    filterByDate: (date) => {
      const initial = get().initialShifts;
      const newShifts = initial.filter((shift) =>
        isSameDay(new Date(shift.startDate), new Date(date))
      );

      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: newShifts ?? [],
          },
        });
      }
    },
    resetShifts: () => {
      if (get().user) {
        set({
          user: {
            ...(get().user as UserType),
            shifts: get().initialShifts,
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
