import { createContext, useContext } from "react";

import { Shift } from "@prisma/client";
import { create, createStore, useStore } from "zustand";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import type { UserStore } from "@/types/store";

interface ShiftStateProps {
  user: UserStore;
  shiftUnclosed: { shift: Shift | null; isLoading: boolean };
  isShiftActive: boolean;
  shiftsInfo: {
    date: string;
    earns: number;
    text: string;
    isLoading: boolean;
    isEmpty: boolean;
  };
  inputsDisabled: boolean;
  differenceBetweenStartAndEnd: string;
}

interface ShiftState extends ShiftStateProps {
  setUser: (user: UserStore) => void;
  updateShift: (shift: Partial<Shift>) => void;
  createShift: (shift: Shift) => void;
  updateShiftsInfo: () => void;
  updateShiftStatus: (state: boolean | undefined) => void;
  updateShiftUnclosed: () => void;
  updateInputsAreDisabled: (state: boolean) => void;
  updateDifferenceBetweenStartAndEnd: (state: string) => void;
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
    shiftUnclosed: {
      shift: null,
      isLoading: true,
    },
    shiftsInfo: {
      date: "",
      earns: 0,
      text: "",
      isLoading: true,
      isEmpty: false,
    },
    isShiftActive: true,
    inputsDisabled: initProps?.inputsDisabled || true,
    differenceBetweenStartAndEnd: "",
  };
  return create<ShiftState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setUser: (user: UserStore) => {
      set((state) => {
        return {
          ...state,
          user,
        };
      });
    },
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
          shiftsInfo: {
            ...state.shiftsInfo,
            isEmpty: !state.user?.shifts?.length,
          },
        };
      });
    },
    createShift: (shift: Shift) => {
      set((state) => {
        return {
          ...state,
          user: {
            ...state.user,
            shifts: [...(state?.user?.shifts ?? []), shift],
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

        if (!lastShiftClosed)
          return {
            ...state,
            shiftsInfo: {
              ...state.shiftsInfo,
              isLoading: false,
              isEmpty: !getter?.shifts?.length,
            },
          };

        const humanizeDateLastShiftClosed = new DateHumanizer("today").humanizeDate(
          new Date(lastShiftClosed?.startDate ?? "") ?? Date.now()
        );

        const distanceLastShiftClosed = ShiftService.differenceInHHmm(
          new Date(lastShiftClosed?.startDate ?? ""),
          new Date(lastShiftClosed?.endDate ?? "")
        );

        const dateHumanized = getter?.shifts?.reduce(
          (acc, curr) => {
            if (curr?.endDate === null) return acc;

            const { diff } = ShiftService.differenceInHHmm(
              new Date(curr?.startDate ?? ""),
              new Date(curr?.endDate ?? "")
            );
            const costDiff = diff * costMinute;
            const earns = acc.earns + costDiff;

            return {
              earns: earns,
            };
          },
          {
            earns: 0,
          }
        );

        return {
          ...state,
          shiftsInfo: {
            ...state.shiftsInfo,
            date: humanizeDateLastShiftClosed,
            earns: dateHumanized?.earns ?? 0,
            text: distanceLastShiftClosed?.text ?? "",
            isLoading: false,
            isEmpty: !getter?.shifts?.length,
          },
        };
      });
    },
    updateShiftStatus: (newState: boolean | undefined) => {
      set((state) => {
        return {
          ...state,
          isShiftActive: newState,
        };
      });
    },
    updateShiftUnclosed: () => {
      set((state) => {
        const getter = get()?.user;
        const lastShift = ShiftService.findUnClosedShift(getter?.shifts || []);

        return {
          ...state,
          shiftUnclosed: {
            shift: lastShift ?? null,
            isLoading: false,
          },
        };
      });
    },
    updateInputsAreDisabled: (state) => {
      set((s) => {
        return {
          ...s,
          inputsDisabled: state,
        };
      });
    },
    updateDifferenceBetweenStartAndEnd: (state) => {
      set((s) => {
        return {
          ...s,
          differenceBetweenStartAndEnd: state,
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
