"use client";

import { useEffect, useRef } from "react";

import { Shift } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import { UserType } from "@/types";

import { createShiftStatusStore, ShiftStatusContext } from "@/store/useShiftStatusStore";

type Props = {
  children: React.ReactNode;
  user: Omit<UserType, "password"> | null;
  shiftOpen: Shift | null;
};

function ShiftStatusProvider({ children, user, shiftOpen }: Props) {
  const { data } = useSession();
  const store = useRef(
    createShiftStatusStore({ user: user, shiftUnclosed: { shift: shiftOpen, isLoading: false } })
  ).current;
  const query = useQuery({
    queryKey: ["user", user?.email],
    queryFn: () =>
      api.getUserByEmail.bind(api)({
        email: user?.email,
        shifts: true,
        profile: true,
        hasEnvUrl: false,
      }),
    enabled: !!data?.user?.email,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    const { setUser, updateShiftsInfo, updateShiftUnclosed } = store.getState();

    query.isSuccess && setUser(query?.data?.user);

    updateShiftsInfo();
    updateShiftUnclosed();
  }, [query?.data?.user, query.isSuccess, store, user]);

  return <ShiftStatusContext.Provider value={store}>{children}</ShiftStatusContext.Provider>;
}

export default ShiftStatusProvider;
