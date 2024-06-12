"use client";

import { useEffect, useRef } from "react";

import { useQuery } from "@tanstack/react-query";

import api from "@/services/Api";

import type { UserType } from "@/types";

import { createDashboardStore, DashboardContext } from "@/store/useDashboardStore";

type Props = {
  children: React.ReactElement | React.ReactElement[] | null;
  user: UserType | null;
};

/**
 * @deprecated Use `useDashboardStore` (named as `useDashboardStore_v2`) instead and combine it with useUser hook to get the user data
 * or use directly useDashboard custom hook
 * ```tsx
 *    const { user } = useDashboard();
 * ```
 */
function DashboardProvider({ children, user }: Props) {
  const store = useRef(createDashboardStore({ user })).current;
  const query = useQuery({
    queryKey: ["user", user?.email],
    queryFn: () =>
      api.getUserByEmail.bind(api)({
        email: user?.email,
        shifts: true,
        profile: true,
        config: true,
        hasEnvUrl: false,
      }),
  });

  useEffect(() => {
    if (query.isError) {
      store.setState({ user });
    } else {
      query.isSuccess && store.setState({ user: query?.data?.user as UserType });
    }
  }, [query, store, user]);

  return <DashboardContext.Provider value={store}>{children}</DashboardContext.Provider>;
}

export default DashboardProvider;
