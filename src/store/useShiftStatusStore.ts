import { createContext, useContext } from "react";

import { Hourly, Production, Profile, Shift, User } from "@prisma/client";
import { create, useStore } from "zustand";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";

type UserShiftStateType = Omit<User, "password"> & {
  shifts: Partial<Shifts> | null;
  profile: Profile | null;
};

type Shifts = Shift & {
  production: Production[];
  hourly: Hourly[];
};

type ShiftType = Hourly | Production;

interface ShiftStateProps {
  user: Partial<UserShiftStateType> | null;
  shiftUnclosed: { shift: Partial<Hourly> | null; isLoading: boolean };

  isShiftActive: boolean;
  clickOnSave: boolean;
  initialShiftState: {
    diff: string;
    from: string;
    to: string;
    start: string;
    end: string;
  };
  shiftsInfo: {
    date: string;
    earns: number;
    text: string;
    isLoading: boolean;
    isEmpty: boolean;
  };
  inputsDisabled: boolean;
  differenceBetweenStartAndEnd: string;
  buttonClicked: {
    edit: boolean;
    cancel: boolean;
    ok: boolean;
    moveOn: boolean;
  };
}

interface ShiftState extends ShiftStateProps {
  setUser: (user: Partial<UserShiftStateType> | null) => void;
  getShift: (id: number | undefined) => Hourly | undefined;
  setButtonClicked: (button: Partial<ShiftStateProps["buttonClicked"]>) => void;
  updateShift: (shift: Partial<ShiftType>) => void;
  setClickOnSave: (state: boolean) => void;
  createShift: (shift: Hourly) => void;
  updateShiftsInfo: () => void;
  updateShiftStatus: (state: boolean | undefined) => void;
  updateShiftUnclosed: () => void;
  setInitialShiftState: (state: Partial<ShiftStateProps["initialShiftState"]>) => void;
  updateInputsAreDisabled: (state: boolean) => void;
  updateDifferenceBetweenStartAndEnd: (state: string) => void;
}

type ShiftStateStore = ReturnType<typeof createShiftStatusStore>;

export function createShiftStatusStore(initProps?: Partial<ShiftStateProps>) {
  const DEFAULT_PROPS: ShiftStateProps = {
    user: initProps?.user || null,
    shiftUnclosed: {
      shift: initProps?.shiftUnclosed?.shift || null,
      isLoading: true,
    },
    clickOnSave: false,
    buttonClicked: {
      edit: true,
      cancel: false,
      ok: false,
      moveOn: true,
    },
    initialShiftState: {
      diff: "",
      from: "",
      to: "",
      start: "",
      end: "",
    },
    shiftsInfo: {
      date: "",
      earns: 0,
      text: "",
      isLoading: true,
      isEmpty: false,
    },
    isShiftActive: false,
    inputsDisabled: initProps?.inputsDisabled || true,
    differenceBetweenStartAndEnd: "",
  };
  return create<ShiftState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setUser: (user: Partial<UserShiftStateType> | null) => {
      set((state) => {
        return {
          ...state,
          user,
        };
      });
    },
    getShift: (id: number | undefined) => {
      if (!id) return undefined;

      const hourly = get()?.user?.shifts?.hourly;

      return hourly?.find((h) => h.id === id);
    },
    updateShift: (shift: Partial<ShiftType>) => {
      set((state) => {
        return {
          ...state,
          user: {
            ...state.user,
            shifts: {
              id: state.user?.shifts?.id as number,
              userId: state.user?.shifts?.userId as string,
              hourly: state.user?.shifts?.hourly?.map((h) => {
                if (h.id === shift.id) return { ...h, ...shift };
                return h;
              }),
              production: state.user?.shifts?.production?.map((p) => {
                if (p.id === shift.id) return { ...p, ...shift };
                return p;
              }),
            },
          },
          shiftsInfo: {
            ...state.shiftsInfo,
            isEmpty: !state.user?.shifts?.hourly?.length && !state.user?.shifts?.production?.length,
          },
        };
      });
    },
    createShift: (shift: Hourly) => {
      set((state) => {
        return {
          ...state,
          user: {
            ...state.user,
            shifts: {
              id: state.user?.shifts?.id as number,
              userId: state.user?.shifts?.userId as string,
              hourly: state.user?.shifts?.hourly?.concat(shift),
              production: state.user?.shifts?.production,
            },
          },
        };
      });
    },
    setClickOnSave: (state: boolean) => {
      set((s) => {
        return {
          ...s,
          clickOnSave: state,
        };
      });
    },
    setButtonClicked: (button) => {
      set((state) => {
        return {
          ...state,
          buttonClicked: {
            ...state.buttonClicked,
            ...button,
          },
        };
      });
    },
    updateShiftsInfo: () => {
      set((state) => {
        state.shiftsInfo.isLoading = true;

        const getter = get()?.user;

        const lastShiftClosed = ShiftService.getLatestShift(getter?.shifts);

        if (!lastShiftClosed)
          return {
            ...state,
            shiftsInfo: {
              ...state.shiftsInfo,
              isLoading: false,
              isEmpty: !getter?.shifts?.hourly?.length && !getter?.shifts?.production?.length,
            },
          };

        const humanizeDateLastShiftClosed = new DateHumanizer("today").humanizeDate(
          new Date(lastShiftClosed?.startDate ?? "") ?? Date.now()
        );

        const distanceLastShiftClosed = ShiftService.differenceInHHmm(
          new Date(lastShiftClosed?.startDate ?? ""),
          new Date(lastShiftClosed?.endDate ?? "")
        );

        const hourlyEarnings = getter?.shifts?.hourly?.reduce((acc, curr) => {
          return acc + new ShiftService(curr).calculateEarnings();
        }, 0);

        const productionEarnings = getter?.shifts?.production?.reduce((acc, curr) => {
          return acc + new ShiftService(curr).calculateEarnings();
        }, 0);

        return {
          ...state,
          shiftsInfo: {
            ...state.shiftsInfo,
            date: humanizeDateLastShiftClosed,
            earns: (hourlyEarnings ?? 0) + (productionEarnings ?? 0),
            text: distanceLastShiftClosed?.text ?? "",
            isLoading: false,
            isEmpty: !getter?.shifts?.hourly?.length && !getter?.shifts?.production?.length,
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
        const lastShift = HourlyService.findUnClosedShift(getter?.shifts?.hourly);

        return {
          ...state,
          shiftUnclosed: {
            shift: {
              ...lastShift,
            },
            isLoading: false,
          },
        };
      });
    },
    setInitialShiftState: (state) => {
      set((s) => {
        return {
          ...s,
          initialShiftState: {
            ...s.initialShiftState,
            ...state,
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
  if (!store) throw new Error("Missing ShiftContext.Provider in the tree");
  return useStore(store, selector);
}
