import { type PropsWithChildren } from "react";

import HourlyService from "@/services/Shift/Hourly";

import HydrateStore from "@/components/structures/Track/HydrateStore";

export default async function Template({ children }: PropsWithChildren) {
  const shifts = await HourlyService.getHourlyShifts();

  return <HydrateStore data={{ shifts }}>{children}</HydrateStore>;
}
