import { useEffect } from "react";

import { isEqual } from "lodash";

import useUser from "@/hooks/useUser";

import { useDashboardStore } from "@/store/useDashboardStore_v2";

function useDashboard() {
  const { data, isLoading } = useUser();
  const {
    setUser,
    deleteShift,
    filterByDate,
    initialShifts,
    resetShifts,
    update,
    user,
    isUserLoaded,
    setIsUserLoaded,
    setInitialShifts,
  } = useDashboardStore((state) => state);

  useEffect(() => {
    if (!data) return;

    if (isEqual(user, data)) return;

    setUser(data);
  }, [data, setUser, user]);

  useEffect(() => {
    if (!isLoading) return;
    if (!data) return;
    if (isUserLoaded) return;

    setInitialShifts(data?.shifts);

    setIsUserLoaded(true);
  }, [isLoading, data, isUserLoaded, setIsUserLoaded, setInitialShifts]);

  return { deleteShift, filterByDate, initialShifts, resetShifts, update, user };
}

export default useDashboard;
