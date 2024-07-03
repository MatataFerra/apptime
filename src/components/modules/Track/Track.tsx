import dynamic from "next/dynamic";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import HydrateStore from "@/components/structures/Track/HydrateStore";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-1/2 w-1/3" />,
});

const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full" spacing={8}>
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

const Buttons = dynamic(() => import("@/components/modules/Track/Buttons"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <Skeleton classes="h-12 w-full" />
      <Skeleton classes="h-12 w-full" />
    </Stack>
  ),
});

const NotesPortal = dynamic(() => import("@/components/modules/Notes/Portal"), {
  ssr: false,
});

const FabMenu = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
  loading: () => <Skeleton classes="absolute bottom-36 right-2 size-20 rounded-full  p-2" />,
});

async function Track() {
  const user = await UserService.getSessionUser();

  if (!user) {
    return ut.redirectTo(PATH_NAMES.LOGIN);
  }
  return (
    <>
      <HydrateStore data={{ user }}>
        <Stack
          orientation="vertical"
          justifyContent="between"
          classes="h-[70dvh] w-full"
          spacing={8}
        >
          <Stack orientation="vertical" classes="h-full w-full">
            <State />
            <MonitorScreen />
          </Stack>
          <Buttons />
        </Stack>
        <FabMenu />
        <NotesPortal />
      </HydrateStore>
    </>
  );
}

export default Track;
