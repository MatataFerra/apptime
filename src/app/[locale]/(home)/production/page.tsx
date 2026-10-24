import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function ProductionJobPage() {
  const t = await getTranslations("modules.production");

  return <ModuleTitle module={PATH_NAMES.PRODUCTION} title={t("title")} subtitle={t("subtitle")} />;
}
