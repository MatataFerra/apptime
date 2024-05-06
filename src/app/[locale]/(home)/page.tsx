import { redirect } from "next/navigation";

import i18n from "@/services/i18n";
import UserService from "@/services/User";

import { type LocaleParams } from "@/types";

import HomeContent from "@/components/HomeContent";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return redirect(PATH_NAMES.HOME);
  }

  const user = await UserService.getSessionUser();

  return (
    <>
      <HomeContent user={user} params={params} />
    </>
  );
}
