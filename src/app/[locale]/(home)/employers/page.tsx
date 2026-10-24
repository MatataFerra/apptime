import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { EmployerList } from "./lazy";

export default async function EmployersPage() {
  const t = await getTranslations("modules.employers");

  return (
    <div className="flex flex-col gap-6">
      <ModuleTitle module={PATH_NAMES.EMPLOYERS} title={t("title")} subtitle={t("subtitle")} />
      <EmployerList />
    </div>
  );
}
