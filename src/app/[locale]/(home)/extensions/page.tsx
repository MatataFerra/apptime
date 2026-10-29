import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { VisaReport } from "./lazy";

export default async function ExtensionsPage() {
  const t = await getTranslations("modules.extensions");

  return (
    <div className="flex flex-col gap-6">
      <ModuleTitle module={PATH_NAMES.EXTENSIONS} title={t("title")} subtitle={t("subtitle")} />
      <VisaReport />
    </div>
  );
}
