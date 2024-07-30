import type { PropsWithChildren, ReactNode } from "react";

import isEmpty from "lodash/isEmpty";

import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

export default async function LayoutScreen({
  tracker,
  children,
}: PropsWithChildren<{ tracker: ReactNode }>) {
  const user = await UserService.getSessionUser();
  const shiftOpen = HourlyService.findUnClosedShift(user?.shifts?.hourly);

  return <>{isEmpty(shiftOpen) ? <>{children}</> : <>{tracker}</>}</>;
}
