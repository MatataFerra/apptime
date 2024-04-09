import { Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import i18n from "@/services/i18n";
import ShiftService from "@/services/Shift";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
import ShiftStatus from "@/components/ShiftStatus";
import ShiftTextState from "@/components/ShiftTextState";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import WelcomeTitle from "@/components/WelcomeTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const Fab = dynamic(() => import("@/components/NotesFab"), { ssr: false });
const Notes = dynamic(() => import("@/components/NotesPortal"), { ssr: false });
const ShiftProvider = dynamic(() => import("@/providers/ShiftStatusProvider"));
const Buttons = dynamic(() => import("@/components/ShiftButtons"), {
  ssr: false,
  loading: () => (
    <>
      <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
        <Skeleton classes="h-12 w-full" />
        <Skeleton classes="h-12 w-full" />
      </Stack>
    </>
  ),
});

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return ut.redirectTo(PATH_NAMES.HOME);
  }

  const user = await UserService.getSessionUser();

  if (!user) {
    return ut.redirectTo(PATH_NAMES.LOGIN);
  }

  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts) as Shift | null;

  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <WelcomeTitle user={user} />
          <DateComponent locale={params.locale} />
        </Stack>
        <ShiftProvider user={user} shiftOpen={shiftUnclosed}>
          <ShiftTextState />
          <ShiftStatus />
          <Buttons />
          <Fab />
          <Notes />
        </ShiftProvider>
      </Stack>
    </>
  );
}
