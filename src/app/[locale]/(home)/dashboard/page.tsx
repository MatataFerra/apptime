import type { LocaleParams } from "@/types";

import Carousel from "@/components/modules/Dashboard/CarouselCards";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export const dynamic = "force-static";

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  return (
    <Stack orientation="vertical" spacing={5} classes="w-full">
      <ModuleTitle
        module={PATH_NAMES.DASHBOARD}
        title="Dashboard"
        subtitle="Your hours and earnings, all in one place."
      />
      <Carousel params={params} />
    </Stack>
  );
}
