import dynamic from "next/dynamic";

import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import type { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const Track = dynamic(() => import("@/components/modules/Track/Track"), {
  ssr: false,
});

const Title = dynamic(() => import("@/components/structures/share/ModuleTitle"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-80" />,
});

export default async function TrackPage({ params }: { params: LocaleParams }) {
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
      <Title title="Track" subtitle="Get your exact time while you work" />
      <Track />
    </>
  );
}
