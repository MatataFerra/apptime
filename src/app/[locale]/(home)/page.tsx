import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import i18n from "@/services/i18n";
import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeContent = dynamic(() => import("@/components/HomeContent"), {
  ssr: false,
});

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return redirect(PATH_NAMES.HOME);
  }

  const user = await UserService.getSessionUser();

  if (!user) {
    return redirect(PATH_NAMES.LOGIN);
  }

  return (
    <>
      <HomeContent user={user} params={params} />
    </>
  );
}
