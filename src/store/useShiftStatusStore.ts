import { createContext, useContext } from "react";

import { Shift } from "@prisma/client";
import { createStore, useStore } from "zustand";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import type { UserStore } from "@/types/store";

interface ShiftStateProps {
  user: UserStore;
  shiftsInfo: {
    date: string;
    earns: number;
    text: string;
    isLoading: boolean;
  };
}

interface ShiftState extends ShiftStateProps {
  updateShift: (shift: Partial<Shift>) => void;
  updateShiftsInfo: () => void;
}

type ShiftStateStore = ReturnType<typeof createShiftStatusStore>;

export function createShiftStatusStore(initProps?: Partial<ShiftStateProps>) {
  const DEFAULT_PROPS: ShiftStateProps = {
    user: initProps?.user || {
      id: "",
      email: "",
      emailVerified: null,
      image: null,
      name: "",
      password: null,
      type_account: "CREDENTIALS",
      role: "USER",
      online: false,
      formCompleted: false,
      isActive: false,
      shifts: [],
      profile: null,
    },
    shiftsInfo: {
      date: "",
      earns: 0,
      text: "",
      isLoading: true,
    },
  };
  return createStore<ShiftState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    updateShift: (shift: Partial<Shift>) => {
      set((state) => {
        return {
          ...state,
          user: {
            ...state.user,
            shifts: state.user?.shifts?.map((s) => {
              if (s.id === shift.id) return { ...s, ...shift };
              return s;
            }),
          },
        };
      });
    },
    updateShiftsInfo: () => {
      set((state) => {
        state.shiftsInfo.isLoading = true;
        const getter = get()?.user;
        const hourlyRate = getter?.profile?.hourlyRate || 60;
        const costMinute = hourlyRate / 60;

        const lastShiftClosed = ShiftService.shiftsSorted(getter?.shifts)?.find((shift) => {
          return shift?.endDate !== null;
        });

        if (!lastShiftClosed) return state;

        const humanizeDate = new DateHumanizer("today").humanizeDate(
          new Date(lastShiftClosed?.startDate ?? "") ?? Date.now()
        );

        const dateHumanized = getter?.shifts?.reduce(
          (acc, curr) => {
            const { diff, text } = ShiftService.differenceInHHmm(
              new Date(curr?.startDate ?? ""),
              new Date(curr?.endDate ?? "")
            );
            const costDiff = diff * costMinute;
            const earns = acc.earns + costDiff;

            return {
              earns: earns,
              text: text,
            };
          },
          {
            earns: 0,
            text: "",
          }
        );

        return {
          ...state,
          shiftsInfo: {
            ...state.shiftsInfo,
            date: humanizeDate,
            earns: dateHumanized?.earns ?? 0,
            text: dateHumanized?.text ?? "",
            isLoading: false,
          },
        };
      });
    },
  }));
}

export const ShiftStatusContext = createContext<ShiftStateStore | null>(null);

export function useShiftStateContext<T>(selector: (state: ShiftState) => T): T {
  const store = useContext(ShiftStatusContext);
  if (!store) throw new Error("Missing BearContext.Provider in the tree");
  return useStore(store, selector);
}
