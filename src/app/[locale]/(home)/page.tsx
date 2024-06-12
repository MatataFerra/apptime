import { redirect } from "next/navigation";

import i18n from "@/services/i18n";

import { type LocaleParams } from "@/types";

import Content from "@/components/modules/Home/Content";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return redirect(PATH_NAMES.HOME);
  }

  return <Content params={params} />;
}
