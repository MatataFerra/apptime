import { createContext, useContext } from "react";

import { Shift } from "@prisma/client";
import { create, useStore } from "zustand";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import type { UserStore } from "@/types/store";

interface ShiftStateProps {
  user: UserStore;
  shiftUnclosed: { shift: Shift | null; isLoading: boolean };

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
  setUser: (user: UserStore) => void;
  getShift: (id: number | undefined) => Shift | undefined;
  setButtonClicked: (button: Partial<ShiftStateProps["buttonClicked"]>) => void;
  updateShift: (shift: Partial<Shift>) => void;
  setClickOnSave: (state: boolean) => void;
  createShift: (shift: Shift) => void;
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
    setUser: (user: UserStore) => {
      set((state) => {
        return {
          ...state,
          user,
        };
      });
    },
    getShift: (id: number | undefined) => {
      const getter = get()?.user;
      if (!id) return undefined;
      return getter?.shifts?.find((shift) => shift?.id === id);
    },
    updateShift: (shift: Partial<Shift>) => {
      set((state) => {
        return {
          ...state,
          user: {
            ...state.user,
            shifts: state.user?.shifts?.map((s) => {
              if (s.id === shift.id)
                return {
                  ...s,
                  ...shift,
                };
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

        const shiftsEarnings = getter?.shifts?.reduce((acc, curr) => {
          if (curr?.endDate === null) return acc;

          const earns = acc + ShiftService.calculateEarnings({ shift: curr });

          return earns;
        }, 0);

        return {
          ...state,
          shiftsInfo: {
            ...state.shiftsInfo,
            date: humanizeDateLastShiftClosed,
            earns: shiftsEarnings ?? 0,
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
  if (!store) throw new Error("Missing BearContext.Provider in the tree");
  return useStore(store, selector);
}
