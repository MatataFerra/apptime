import { createContext, useContext } from "react";

import { Shift } from "@prisma/client";
import { createStore, useStore } from "zustand";

import type { UserStore } from "@/types/store";

interface ShiftStateProps {
  user: UserStore;
}

interface ShiftState extends ShiftStateProps {
  updateShift: (shift: Partial<Shift>) => void;
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
  };
  return createStore<ShiftState>()((set) => ({
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
  }));
}

export const ShiftStatusContext = createContext<ShiftStateStore | null>(null);

export function useShiftStateContext<T>(selector: (state: ShiftState) => T): T {
  const store = useContext(ShiftStatusContext);
  if (!store) throw new Error("Missing BearContext.Provider in the tree");
  return useStore(store, selector);
}
