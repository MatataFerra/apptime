import { getServerSession } from "next-auth";

import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
import HomeButtons from "@/components/Home/Buttons";
import ShiftStatus from "@/components/ShiftStatus";
import ShiftTextState from "@/components/ShiftTextState";
import Stack from "@/components/ui/Stack";
import WelcomeTitle from "@/components/WelcomeTitle";

import ShiftStatusProvider from "@/providers/ShiftStatus";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return ut.redirectTo(PATH_NAMES.HOME);
  }

  const session = await getServerSession();
  const user = await UserService.findUniqueUser({
    email: session?.user?.email,
    shifts: true,
    profile: true,
  });

  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <WelcomeTitle />
          <DateComponent locale={params.locale} />
        </Stack>
        <ShiftStatusProvider user={user}>
          <ShiftTextState />
          <ShiftStatus />
          <HomeButtons />
        </ShiftStatusProvider>
      </Stack>
    </>
  );
}
