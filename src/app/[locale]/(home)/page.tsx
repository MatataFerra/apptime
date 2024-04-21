import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import HomeCards from "@/components/HomeCards";

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

  return (
    <>
      <HomeCards />
    </>
  );
}
