import { Shift } from "@prisma/client";

import i18n from "@/services/i18n";
import ShiftService from "@/services/Shift";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
import NotesFab from "@/components/NotesFab";
import NotesPortal from "@/components/NotesPortal";
import ShiftButtons from "@/components/ShiftButtons";
import ShiftStatus from "@/components/ShiftStatus";
import ShiftTextState from "@/components/ShiftTextState";
import Stack from "@/components/ui/Stack";
import WelcomeTitle from "@/components/WelcomeTitle";

import ShiftStatusProvider from "@/providers/ShiftStatusProvider";

import { PATH_NAMES } from "@/utils/constants/pathnames";

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
        <ShiftStatusProvider user={user} shiftOpen={shiftUnclosed}>
          <ShiftTextState />
          <ShiftStatus />
          <ShiftButtons />
          <NotesFab />
          <NotesPortal />
        </ShiftStatusProvider>
      </Stack>
    </>
  );
}
