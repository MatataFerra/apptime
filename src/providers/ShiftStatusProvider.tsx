"use client";

import { useEffect, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import api from "@/services/Api";

import ShiftSkeleton from "@/components/ShiftSkeleton";

import { createShiftStatusStore, ShiftStatusContext } from "@/store/useShiftStatusStore";

type Props = {
  children: React.ReactNode;
};

function ShiftStatusProvider({ children }: Props) {
  const { data } = useSession();
  const store = useRef(createShiftStatusStore()).current;
  const query = useQuery({
    queryKey: ["user", data?.user?.email],
    queryFn: () =>
      api.getUserByEmail.bind(api)({
        email: data?.user?.email,
        shifts: true,
        profile: true,
        hasEnvUrl: false,
      }),
    enabled: !!data?.user?.email,
  });

  useEffect(() => {
    const { setUser, updateShiftsInfo, updateShiftUnclosed } = store.getState();

    if (query.isSuccess) setUser(query.data?.user);
    updateShiftsInfo();
    updateShiftUnclosed();
  }, [query.data?.user, query.isSuccess, store]);

  return (
    <ShiftStatusContext.Provider value={store}>
      {query.isPending ? <ShiftSkeleton /> : children}
    </ShiftStatusContext.Provider>
  );
}

export default ShiftStatusProvider;
