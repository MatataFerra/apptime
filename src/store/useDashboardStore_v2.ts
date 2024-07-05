import { type DateRange } from "react-day-picker";

import { isWithinInterval } from "date-fns";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { UserType } from "@/types";

interface DashboardState {
  user: UserType | null;
  isUserLoaded: boolean;
  initialShifts: UserType["shifts"];
  setUser: (user: UserType) => void;
  setInitialShifts: (shifts: UserType["shifts"]) => void;
  update: (props: Partial<UserType>) => void;
  deleteShift: (id: number) => void;
  filterByDate: (date: DateRange | undefined) => void;
  resetShifts: () => void;
  setIsUserLoaded: (isUserLoaded: boolean) => void;
}

export const useDashboardStore = create(
  devtools<DashboardState>(
    (set, get) => ({
      isUserLoaded: false,
      initialShifts: {
        id: 0,
        userId: "",
        hourly: [],
        production: [],
      },
      user: null,
      setUser: (user) => {
        return set({ user }, false, "SET_DASHBOARD_USER");
      },
      setInitialShifts: (shifts) => {
        return set({ initialShifts: shifts });
      },
      update: (props) => {
        return set({ ...get(), ...props });
      },
      deleteShift: (id) => {
        const hourly = get().user?.shifts?.hourly.filter((shift) => shift.id !== id);
        const production = get().user?.shifts?.production.filter((shift) => shift.id !== id);

        return set({
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

        const prepareHourly = [...(hourly ?? [])];
        const prepareProduction = [...(production ?? [])];

        return set(
          (state) => {
            return {
              ...state,
              user: {
                ...(state.user as UserType),
                shifts: {
                  id: get().user?.shifts?.id ?? 0,
                  userId: get().user?.shifts?.userId ?? "",
                  hourly: prepareHourly,
                  production: prepareProduction,
                },
              },
            };
          },
          false,
          "FILTER_BY_DATE"
        );
      },
      resetShifts: () => {
        return set(
          {
            user: {
              ...(get().user as UserType),
              shifts: {
                id: get().user?.shifts?.id ?? 0,
                userId: get().user?.shifts?.userId ?? "",
                hourly: get().initialShifts?.hourly ?? [],
                production: get().initialShifts?.production ?? [],
              },
            },
          },
          false,
          "RESET_SHIFTS"
        );
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
