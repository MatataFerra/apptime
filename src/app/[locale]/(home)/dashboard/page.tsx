import dynamic from "next/dynamic";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const CarouselCards = dynamic(() => import("@/components/modules/Dashboard/CarouselCards"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full max-w-[90svw] overflow-hidden">
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
    </Stack>
  ),
});

const Dashboard = dynamic(() => import("@/components/modules/Dashboard/Dashboard"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="horizontal" alignItems="center" justifyContent="between" classes="w-full">
        <Skeleton classes="h-10 w-60" />
        <Skeleton classes="h-10 w-32" />
      </Stack>
      <Stack
        orientation="vertical"
        classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-gray-200 bg-white shadow-input"
      >
        <Skeleton classes="h-full w-full" />
      </Stack>
      <Skeleton classes="mx-auto mt-8 h-full w-full max-w-xl" />
    </>
  ),
});

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <CarouselCards params={params} />
      <Dashboard />
    </Stack>
  );
}
