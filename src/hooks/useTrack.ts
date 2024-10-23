import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ShiftStateProps {
  isClosing: boolean;
  isShiftActive: boolean;
}

export interface ShiftState extends ShiftStateProps {
  updateShiftStatus: (state: boolean | undefined) => void;
  setIsClosing: (close: boolean) => void;
}

export const useTrackStore = create(
  devtools<ShiftState>((set, get) => ({
    isShiftActive: false,
    isClosing: false,
    setIsClosing: (close: boolean) => {
      set((state) => ({
        ...state,
        isClosing: close,
      }));
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
  const { ...methods } = useTrackStore((state) => state);

  return {
    ...methods,
  };
}

export default useTrack;
