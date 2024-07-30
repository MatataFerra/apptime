import type { PropsWithChildren, ReactNode } from "react";

import isEmpty from "lodash/isEmpty";

import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

export default async function LayoutScreen({
  children,
  tracker,
}: PropsWithChildren<{ tracker: ReactNode }>) {
  return <>{tracker}</>;
}
