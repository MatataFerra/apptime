import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import i18n from "@/services/i18n";
import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCards = dynamic(() => import("@/components/HomeCards"), {
  ssr: false,
  loading: () => (
    <>
      <Stack classes="h-full w-full" orientation="vertical" spacing={4}>
        <Skeleton classes="h-full w-full" />
        <Skeleton classes="h-full w-full" />
        <Skeleton classes="h-full w-full" />
      </Stack>
    </>
  ),
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
      <HomeCards />
    </>
  );
}
