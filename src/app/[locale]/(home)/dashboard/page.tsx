import { getTranslations } from "next-intl/server";

import Carousel from "@/components/modules/Dashboard/CarouselCards";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function HistoryShift() {
  const t = await getTranslations("modules.dashboard");

  return (
    <Stack orientation="vertical" spacing={5} classes="w-full">
      <ModuleTitle module={PATH_NAMES.DASHBOARD} title={t("title")} subtitle={t("subtitle")} />
      <Carousel />
    </Stack>
  );
}
