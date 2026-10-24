import { useTranslations } from "next-intl";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

function Title() {
  const t = useTranslations("modules.compare");

  return <ModuleTitle module={PATH_NAMES.COMPARE} title={t("title")} subtitle={t("subtitle")} />;
}

export default Title;
