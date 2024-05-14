import { Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import { UserType } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const ShiftStatusProvider = dynamic(() => import("@/providers/ShiftStatusProvider"), {
  ssr: false,
  loading: () => <Skeleton classes="h-full w-full" />,
});

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

const NotesFab = dynamic(() => import("@/components/structures/Notes/Fab"), {
  ssr: false,
  loading: () => <Skeleton classes="absolute bottom-36 right-2 size-20 rounded-full  p-2" />,
});

type Props = {
  user: UserType;
  shiftUnclosed: Shift | null;
};

function Track({ user, shiftUnclosed }: Props) {
  return (
    <ShiftStatusProvider user={user} shiftOpen={shiftUnclosed}>
      <State />
      <MonitorScreen />
      <Buttons />
      <NotesFab />
      <NotesPortal />
    </ShiftStatusProvider>
  );
}

export default Track;
