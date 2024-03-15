"use client";

import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { UserType } from "@/types";

import { createDashboardStore, DashboardContext } from "@/store/useDashboardStore";

type Props = {
  children: React.ReactElement | React.ReactElement[] | null;
  user: UserType | null;
};

function DashboardProvider({ children, user }: Props) {
  const store = useRef(createDashboardStore({ user: user })).current;
  const queryClient = useQueryClient();

  useEffect(() => {
    const query = queryClient.getQueryData(["user", user?.email]) as { user: UserType } | undefined;

    store.setState({ user: query?.user });
  }, [queryClient, store, user?.email]);

  return <DashboardContext.Provider value={store}>{children}</DashboardContext.Provider>;
}

export default DashboardProvider;
