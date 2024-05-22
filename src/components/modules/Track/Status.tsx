import { Hourly, Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const Track = dynamic(() => import("@/components/modules/Track/Track"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full" spacing={8}>
        <Skeleton classes="h-8 w-1/3" />
        <Skeleton classes="h-[25dvh] w-full" />
      </Stack>
      <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
        <Skeleton classes="h-12 w-full" />
        <Skeleton classes="h-12 w-full" />
      </Stack>
    </>
  ),
});

async function Status() {
  const user = await UserService.getSessionUser();

  if (!user) {
    return ut.redirectTo(PATH_NAMES.LOGIN);
  }

  const shiftUnclosed = HourlyService.findUnClosedShift(user?.shifts?.hourly) as Hourly | null;

  return <Track user={user} shiftUnclosed={shiftUnclosed} />;
}

export default Status;
