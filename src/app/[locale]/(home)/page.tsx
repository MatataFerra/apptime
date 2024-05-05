import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import i18n from "@/services/i18n";
import UserService from "@/services/User";

import { type LocaleParams } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import Skeleton from "@/components/ui/Skeleton";

const HomeContent = dynamic(() => import("@/components/HomeContent"), {
  ssr: false,
  loading: () => <Skeleton classes="h-full w-full" />,
});

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
