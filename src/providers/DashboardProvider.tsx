"use client";

import { useRef } from "react";

import type { UserType } from "@/types";

import { createDashboardStore, DashboardContext } from "@/store/useDashboardStore";

type Props = {
  children: React.ReactElement | React.ReactElement[] | null;
  user: UserType | null;
};

function DashboardProvider({ children, user }: Props) {
  const store = useRef(createDashboardStore({ user: user })).current;

  return <DashboardContext.Provider value={store}>{children}</DashboardContext.Provider>;
}

export default DashboardProvider;
