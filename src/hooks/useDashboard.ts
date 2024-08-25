import { useEffect } from "react";

import isEmpty from "lodash/isEmpty";

import useUser from "@/hooks/useUser";

import { useDashboardStore } from "@/store/useDashboardStore_v2";

function useDashboard() {
  const { data, isLoading, ...rest } = useUser();
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
    isDateFiltered,
  } = useDashboardStore((state) => state);

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;
    if (isDateFiltered) return;

    setUser(data);
  }, [data, isLoading, user, setUser, isDateFiltered]);

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;

    setInitialShifts(data?.shifts);

    setIsUserLoaded(true);
  }, [isLoading, data, isUserLoaded, setIsUserLoaded, setInitialShifts]);

  return {
    deleteShift,
    filterByDate,
    initialShifts,
    resetShifts,
    update,
    user,
    isLoadingUserData: isLoading,
    ...rest,
  };
}

export default useDashboard;
