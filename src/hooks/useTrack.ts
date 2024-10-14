import { useEffect } from "react";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";

import type { HourlyType, UserType } from "@/types";

interface ShiftStateProps {
  shifts: HourlyType[] | Partial<HourlyType[]> | null;
  shiftUnclosed: { shift: Partial<Hourly> | null; isLoading: boolean };
  isClosing: boolean;
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

export interface ShiftState extends ShiftStateProps {
  setShifts: (shifts: HourlyType[] | undefined | null) => void;
  getShift: (id: number | undefined) => Hourly | undefined;
  setButtonClicked: (button: Partial<ShiftStateProps["buttonClicked"]>) => void;
  updateShift: (shift: Partial<HourlyType>) => void;
  setClickOnSave: (state: boolean) => void;
  createShift: (shift: Hourly) => void;
  deleteShift: (id: number) => void;
  updateShiftsInfo: () => void;
  updateShiftStatus: (state: boolean | undefined) => void;
  updateShiftUnclosed: () => void;
  setInitialShiftState: (state: Partial<ShiftStateProps["initialShiftState"]>) => void;
  updateInputsAreDisabled: (state: boolean) => void;
  updateDifferenceBetweenStartAndEnd: (state: string) => void;
  setIsClosing: (close: boolean) => void;
}

export const useTrackStore = create(
  devtools<ShiftState>((set, get) => ({
    shifts: null,
    shiftUnclosed: {
      shift: null,
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
    isClosing: false,
    inputsDisabled: true,
    differenceBetweenStartAndEnd: "",
    setShifts: (shifts: HourlyType[] | null | undefined) => {
      set(
        (state) => {
          return {
            ...state,
            shifts,
          };
        },
        false,
        "SET_USER"
      );
    },
    setIsClosing: (close: boolean) => {
      set((state) => ({
        ...state,
        isClosing: close,
      }));
    },
    getShift: (id: number | undefined) => {
      if (!id) return undefined;

      const hourly = get()?.shifts;

      return hourly?.find((h) => h?.id === id);
    },
    updateShift: (shift: Partial<HourlyType>) => {
      set(
        (state) => {
          const updatedShifts = state?.shifts
            ?.filter((shiftItem) => shiftItem !== undefined)
            .map((h) => {
              if (h && h.id === shift.id) return { ...h, ...shift };
              return h;
            });

          return {
            ...state,
            shifts: updatedShifts,
            shiftsInfo: {
              ...state.shiftsInfo,
              isEmpty: !updatedShifts?.length, // Verificamos el array actualizado
            },
          };
        },
        false,
        "UPDATE_SHIFT"
      );
    },
    createShift: (shift: HourlyType) => {
      set(
        (state) => {
          return {
            ...state,
            shifts: state.shifts?.concat(shift) || [],
          };
        },
        false,
        "CREATE_SHIFT"
      );
    },
    deleteShift: (id: number) => {
      set(
        (state) => {
          return {
            ...state,
            shifts: state.shifts?.filter((h) => h?.id !== id) || [],
            shiftsInfo: {
              ...state.shiftsInfo,
              isEmpty: !state.shifts?.length,
            },
          };
        },
        false,
        "DELETE_SHIFT"
      );
    },
    setClickOnSave: (state: boolean) => {
      set(
        (s) => {
          return {
            ...s,
            clickOnSave: state,
          };
        },
        false,
        "SET_CLICK_ON_SAVE"
      );
    },
    setButtonClicked: (button) => {
      set(
        (state) => {
          return {
            ...state,
            buttonClicked: {
              ...state.buttonClicked,
              ...button,
            },
          };
        },
        false,
        "SET_BUTTON_CLICKED"
      );
    },
    updateShiftsInfo: () => {
      set(
        (state) => {
          state.shiftsInfo.isLoading = true;

          const getter = get()?.shifts;

          if (isEmpty(getter)) return state;

          const lastShiftClosed = HourlyService.getLatestShift(getter as HourlyType[]);

          if (!lastShiftClosed)
            return {
              ...state,
              shiftsInfo: {
                ...state.shiftsInfo,
                isLoading: false,
                isEmpty: !getter?.length,
              },
            };

          const humanizeDateLastShiftClosed = new DateHumanizer("today").humanizeDate(
            new Date(lastShiftClosed?.startDate ?? "") ?? Date.now()
          );

          const distanceLastShiftClosed = ShiftService.differenceInHHmm(
            new Date(lastShiftClosed?.startDate ?? ""),
            new Date(lastShiftClosed?.endDate ?? "")
          );

          const hourlyEarnings = getter?.reduce((acc, curr) => {
            return acc + new HourlyService(curr as HourlyType).calculateEarnings();
          }, 0);

          return {
            ...state,
            shiftsInfo: {
              ...state.shiftsInfo,
              date: humanizeDateLastShiftClosed,
              earns: hourlyEarnings ?? 0,
              text: distanceLastShiftClosed?.text ?? "",
              isLoading: false,
              isEmpty: !getter?.length,
            },
          };
        },
        false,
        "UPDATE_SHIFT_INFO"
      );
    },
    updateShiftStatus: (newState: boolean | undefined) => {
      set(
        (state) => {
          return {
            ...state,
            isShiftActive: newState,
          };
        },
        false,
        "UPDATE_SHIFT_STATUS"
      );
    },
    updateShiftUnclosed: () => {
      set(
        (state) => {
          state.shiftUnclosed.isLoading = true;
          const getter = get()?.shifts;
          const lastShift = HourlyService.findUnClosedShift(getter as HourlyType[]);

          return {
            ...state,
            shiftUnclosed: {
              shift: {
                ...lastShift,
              },
              isLoading: false,
            },
          };
        },
        false,
        "UPDATE_SHIFT_UNCLOSED"
      );
    },
    setInitialShiftState: (state) => {
      set(
        (s) => {
          return {
            ...s,
            initialShiftState: {
              ...s.initialShiftState,
              ...state,
            },
          };
        },
        false,
        "SET_INITIAL_STATE"
      );
    },
    updateInputsAreDisabled: (state) => {
      set(
        (s) => {
          return {
            ...s,
            inputsDisabled: state,
          };
        },
        false,
        "UPDATE_INPUTS_ARE_DISABLE"
      );
    },
    updateDifferenceBetweenStartAndEnd: (state) => {
      set(
        (s) => {
          return {
            ...s,
            differenceBetweenStartAndEnd: state,
          };
        },
        false,
        "UPDATE_DIFF_BW_START_END"
      );
    },
  }))
);

function useTrack() {
  const { shifts, setShifts, updateShiftsInfo, updateShiftUnclosed, ...methods } = useTrackStore(
    (state) => state
  );

  useEffect(() => {
    if (isEmpty(shifts)) return;

    updateShiftsInfo();
  }, [updateShiftsInfo, shifts]);

  useEffect(() => {
    if (isEmpty(shifts)) return;
    updateShiftUnclosed();
  }, [updateShiftUnclosed, shifts]);

  return {
    shifts,
    setShifts,
    updateShiftUnclosed,
    updateShiftsInfo,
    ...methods,
  };
}

export default useTrack;
