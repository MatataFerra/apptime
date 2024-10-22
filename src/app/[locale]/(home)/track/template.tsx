import { type PropsWithChildren } from "react";

import HourlyService from "@/services/Shift/Hourly";

import HydrateStore from "@/components/structures/Track/HydrateStore";

export const revalidate = 30;

export default async function Template({ children }: PropsWithChildren) {
  const shifts = await HourlyService.getHourlyShifts();

  return <HydrateStore data={{ shifts }}>{children}</HydrateStore>;
}
