import { Shift } from "@prisma/client";
import { getServerSession } from "next-auth";

import i18n from "@/services/i18n";
import ShiftService from "@/services/Shift";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
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
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts) as Shift | null;

  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <WelcomeTitle />
          <DateComponent locale={params.locale} />
        </Stack>

        <ShiftStatusProvider user={user} shiftOpen={shiftUnclosed}>
          <ShiftTextState />
          <ShiftStatus />
          <ShiftButtons />
        </ShiftStatusProvider>
      </Stack>
    </>
  );
}
