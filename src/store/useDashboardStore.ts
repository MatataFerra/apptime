import { createContext, useContext } from "react";

import { create, useStore } from "zustand";

import type { UserType } from "@/types";

interface DashboardStateProps {
  user: UserType | null;
}

interface DashboardState extends DashboardStateProps {
  update: (props: Partial<DashboardStateProps["user"]>) => void;
  deleteShift: (id: number) => void;
}

type DashboardStateStore = ReturnType<typeof createDashboardStore>;

export function createDashboardStore(initProps?: Partial<DashboardStateProps>) {
  const DEFAULT_PROPS: DashboardStateProps = {
    user: initProps?.user || null,
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
