import { getTranslations } from "next-intl/server";

import Calculator from "@/components/structures/Incomes/Calculator";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function Incomes() {
  const t = await getTranslations("modules.estimate");

  return (
    <Stack orientation="vertical" spacing={6}>
      <ModuleTitle module={PATH_NAMES.INCOMES} title={t("title")} subtitle={t("subtitle")} />
      <Calculator />
    </Stack>
  );
}
