import i18n from "@/services/i18n";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import WelcomeTitle from "@/components/WelcomeTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return ut.redirectTo(PATH_NAMES.HOME);
  }

  return (
    <>
      <WelcomeTitle />
    </>
  );
}
