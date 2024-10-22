import { useEffect } from "react";

import isEmpty from "lodash/isEmpty";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";

import type { HourlyType } from "@/types";

interface ShiftStateProps {
  shifts: HourlyType[] | Partial<HourlyType[]> | null;
  isClosing: boolean;
  isShiftActive: boolean;
  shiftsInfo: {
    date: string;
    earns: number;
    text: string;
    isLoading: boolean;
    isEmpty: boolean;
  };
}

export interface ShiftState extends ShiftStateProps {
  updateShiftsInfo: () => void;
  updateShiftStatus: (state: boolean | undefined) => void;
  setIsClosing: (close: boolean) => void;
}

export const useTrackStore = create(
  devtools<ShiftState>((set, get) => ({
    shifts: null,
    shiftsInfo: {
      date: "",
      earns: 0,
      text: "",
      isLoading: true,
      isEmpty: false,
    },
    isShiftActive: false,
    isClosing: false,
    setIsClosing: (close: boolean) => {
      set((state) => ({
        ...state,
        isClosing: close,
      }));
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
  }))
);

function useTrack() {
  const { shifts, updateShiftsInfo, ...methods } = useTrackStore((state) => state);

  useEffect(() => {
    if (isEmpty(shifts)) return;

    updateShiftsInfo();
  }, [updateShiftsInfo, shifts]);

  return {
    shifts,
    updateShiftsInfo,
    ...methods,
  };
}

export default useTrack;
