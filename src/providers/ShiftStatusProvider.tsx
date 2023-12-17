"use client";

import { useEffect, useRef } from "react";

import type { UserStore } from "@/types/store";

import { createShiftStatusStore, ShiftStatusContext } from "@/store/useShiftStatusStore";

type Props = {
  children: React.ReactNode;
  user: UserStore;
};

function ShiftStatusProvider({ children, user }: Props) {
  const store = useRef(createShiftStatusStore({ user: user })).current;

  useEffect(() => {
    const { updateShiftsInfo } = store.getState();
    updateShiftsInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ShiftStatusContext.Provider value={store}>{children}</ShiftStatusContext.Provider>;
}

export default ShiftStatusProvider;
