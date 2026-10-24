import { getTranslations } from "next-intl/server";

import Title from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function TrackPage() {
  const t = await getTranslations("modules.track");

  return <Title module={PATH_NAMES.TRACK} title={t("title")} subtitle={t("subtitle")} />;
}
