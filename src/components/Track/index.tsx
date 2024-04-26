import { Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import { UserType } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const ShiftStatusProvider = dynamic(() => import("@/providers/ShiftStatusProvider"), {
  ssr: false,
  loading: () => <Skeleton classes="h-full w-full" />,
});

const ShiftTextState = dynamic(() => import("@/components/ShiftTextState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-1/2 w-1/3" />,
});

const ShiftStatus = dynamic(() => import("@/components/ShiftStatus"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full" spacing={8}>
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

const ShiftButtons = dynamic(() => import("@/components/ShiftButtons"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <Skeleton classes="h-12 w-full" />
      <Skeleton classes="h-12 w-full" />
    </Stack>
  ),
});

const NotesPortal = dynamic(() => import("@/components/NotesPortal"), {
  ssr: false,
});

const NotesFab = dynamic(() => import("@/components/NotesFab"), {
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
      <ShiftTextState />
      <ShiftStatus />
      <ShiftButtons />
      <NotesFab />
      <NotesPortal />
    </ShiftStatusProvider>
  );
}

export default Track;
