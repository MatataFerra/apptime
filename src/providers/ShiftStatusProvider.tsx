"use client";

import { type ReactNode, useEffect, useRef } from "react";

import type { Hourly } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import api from "@/services/Api";

import type { UserType } from "@/types";

import useUser from "@/hooks/useUser";

import { createShiftStatusStore, ShiftStatusContext } from "@/store/useShiftStatusStore";

type Props = {
  children: ReactNode;
  shiftOpen: Hourly | null;
};

/**
 * @deprecated use instead `useTrack` hook, it has all the same logic and resources
 */
function ShiftStatusProvider({ children, shiftOpen }: Props) {
  const { data: user, isLoading } = useUser();
  const store = useRef(
    createShiftStatusStore({
      user: user,
      shiftUnclosed: { shift: shiftOpen, isLoading: false },
    })
  ).current;

  useEffect(() => {
    const { setUser, updateShiftsInfo, updateShiftUnclosed } = store.getState();

    !isLoading && setUser(user);

    updateShiftsInfo();
    updateShiftUnclosed();
  }, [isLoading, store, user]);

  return <ShiftStatusContext.Provider value={store}>{children}</ShiftStatusContext.Provider>;
}

export default ShiftStatusProvider;
