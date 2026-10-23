import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { TaxList } from "./lazy";

export default async function TaxesPage() {
  const t = await getTranslations("modules.taxes");

  return (
    <div className="flex flex-col gap-6">
      <ModuleTitle module={PATH_NAMES.TAXES} title={t("title")} subtitle={t("subtitle")} />
      <TaxList />
    </div>
  );
}
