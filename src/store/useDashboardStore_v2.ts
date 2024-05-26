import { type DateRange } from "react-day-picker";

import { isWithinInterval } from "date-fns";
import { create } from "zustand";

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

export const useDashboardStore = create<DashboardState>((set, get) => ({
  isUserLoaded: false,
  initialShifts: {
    id: 0,
    userId: "",
    hourly: [],
    production: [],
  },
  user: {
    id: "",
    email: "",
    name: "",
    role: "",
    type_account: "",
    config: {
      id: 0,
      userId: "",
      weekStartsOn: "",
    },
    emailVerified: null,
    formCompleted: false,
    image: "",
    isActive: false,
    online: false,
    password: "",
    profile: {
      id: 0,
      userId: "",
      address: "",
      city: "",
      country: "",
      firstName: "",
      lastName: "",
    },
    shifts: {
      id: 0,
      userId: "",
      hourly: [],
      production: [],
    },
  },
  setUser: (user) => {
    return set({ user });
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
    console.log("🚀 ~ useDashboardStore ~ initial:", initial);
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

    return set((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          id: state.user?.id ?? "",
          email: state.user?.email ?? "",
          name: state.user?.name ?? "",
          role: state.user?.role ?? "",
          type_account: state.user?.type_account ?? "",
          emailVerified: state.user?.emailVerified ?? null,
          formCompleted: state.user?.formCompleted ?? false,
          image: state.user?.image ?? "",
          isActive: state.user?.isActive ?? false,
          online: state.user?.online ?? false,
          password: state.user?.password ?? "",
          profile: {
            address: state.user?.profile?.address ?? "",
            city: state.user?.profile?.city ?? "",
            country: state.user?.profile?.country ?? "",
            firstName: state.user?.profile?.firstName ?? "",
            lastName: state.user?.profile?.lastName ?? "",
            id: state.user?.profile?.id ?? 0,
            userId: state.user?.profile?.userId ?? "",
          },
          config: {
            id: state.user?.config?.id ?? 0,
            userId: state.user?.config?.userId ?? "",
            weekStartsOn: state.user?.config?.weekStartsOn ?? "",
          },

          shifts: {
            id: get().user?.shifts?.id ?? 0,
            userId: get().user?.shifts?.userId ?? "",
            hourly: [...(hourly ?? [])],
            production: [...(production ?? [])],
          },
        },
      };
    });
  },
  resetShifts: () => {
    return set({
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
  },

  setIsUserLoaded: (isUserLoaded) => {
    return set({ isUserLoaded });
  },
}));
