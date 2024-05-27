import dynamic from "next/dynamic";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const CarouselCards = dynamic(() => import("@/components/modules/Dashboard/CarouselCards"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full max-w-[90svw] overflow-hidden">
      <Skeleton classes="basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="basis-1/2 sm:basis-1/3 md:basis-1/5" />
    </Stack>
  ),
});

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <CarouselCards params={params} />
    </Stack>
  );
}
