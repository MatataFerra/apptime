import dynamic from "next/dynamic";

import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import DateComponent from "@/components/Date";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import WelcomeTitle from "@/components/WelcomeTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const DynamicShiftTrackStatus = dynamic(() => import("@/components/ShiftTrackStatus"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full" spacing={8}>
        <Skeleton classes="h-8 w-1/3" />
        <Skeleton classes="h-[25dvh] w-full" />
      </Stack>
      <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
        <Skeleton classes="h-12 w-full" />
        <Skeleton classes="h-12 w-full" />
      </Stack>
    </>
  ),
});

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
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <WelcomeTitle user={user} />
          <DateComponent locale={params.locale} />
        </Stack>
        <DynamicShiftTrackStatus />
      </Stack>
    </>
  );
}
