import i18n from "@/services/i18n";
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

  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <WelcomeTitle />
          <DateComponent locale={params.locale} />
        </Stack>

        <ShiftStatusProvider>
          <ShiftTextState />
          <ShiftStatus />
          <ShiftButtons />
        </ShiftStatusProvider>
      </Stack>
    </>
  );
}
