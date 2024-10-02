import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { Shifts, UserType } from "@/types";

interface DashboardState {
  user: UserType | null;
  isUserLoaded: boolean;
  initialShifts: Shifts | null;
  isDateFiltered: boolean;
  setIsDateFiltered: (state: boolean) => void;
  setUser: (user: UserType) => void;
  update: (props: Partial<UserType>) => void;
  setIsUserLoaded: (isUserLoaded: boolean) => void;
}

export const useDashboardStore = create(
  devtools<DashboardState>(
    (set, get) => ({
      isUserLoaded: false,
      isDateFiltered: false,
      initialShifts: null,
      user: null,
      setUser: (user) => {
        return set({ user }, false, "SET_DASHBOARD_USER");
      },
      update: (props) => {
        return set({ ...get(), ...props });
      },
      setIsDateFiltered: (state) => {
        return set({ isDateFiltered: state });
      },

      setIsUserLoaded: (isUserLoaded) => {
        return set({ isUserLoaded });
      },
    }),
    {
      name: "USE_DASHBOARD",
    }
  )
);
