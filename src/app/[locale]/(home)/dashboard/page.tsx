import Carousel from "@/components/modules/Dashboard/CarouselCards";
import ModuleTitle from "@/components/structures/share/ModuleTitle";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

export const dynamic = "force-static";

export default async function HistoryShift(props: PageProps<"/[locale]/dashboard">) {
  const { locale: segment } = await props.params;
  const params = { locale: isLocale(segment) ? segment : "en" } as const;
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
