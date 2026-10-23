import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function FastChargePage() {
  const t = await getTranslations("modules.fast_charge");

  return (
    <ModuleTitle module={PATH_NAMES.FAST_CHARGE} title={t("title")} subtitle={t("subtitle")} />
  );
}
