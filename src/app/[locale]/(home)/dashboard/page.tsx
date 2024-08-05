import type { LocaleParams } from "@/types";

import Carousel from "@/components/modules/Dashboard/CarouselCards";
import Stack from "@/components/ui/Stack";

export const dynamic = "force-dynamic";

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <Carousel params={params} />
    </Stack>
  );
}
