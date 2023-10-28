import i18n from "@/services/i18n";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
import HomeButtons from "@/components/HomeButtons/container";
import PopoverHome from "@/components/Popover/home";
import ShiftStatus from "@/components/ShiftStatus";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";
import WelcomeTitle from "@/components/WelcomeTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default function Home({ params }: { params: LocaleParams }) {
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
        <Text as="h2" classes="text-2xl">
          State: <span className="text-green-500">online</span>
          <PopoverHome />
        </Text>
        <ShiftStatus />
        <HomeButtons />
      </Stack>
    </>
  );
}
