import { useEffect } from "react";

import isEmpty from "lodash/isEmpty";

import useUser from "@/hooks/useUser";

import { useDashboardStore } from "@/store/useDashboardStore_v2";

function useDashboard() {
  const { data, isLoading, ...rest } = useUser();
  const { setUser, initialShifts, update, user, isUserLoaded, setIsUserLoaded, ...store } =
    useDashboardStore((state) => state);

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;

    setUser(data);
  }, [data, isLoading, user, setUser]);

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;

    setIsUserLoaded(true);
  }, [isLoading, data, isUserLoaded, setIsUserLoaded]);

  return {
    initialShifts,
    update,
    user,
    isLoadingUserData: isLoading,
    ...store,
    ...rest,
  };
}

export default useDashboard;
