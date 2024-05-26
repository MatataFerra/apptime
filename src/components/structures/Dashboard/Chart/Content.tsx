"use client";

import { Hourly, Production, Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import useDashboard from "@/hooks/useDashboard";

import { useDashboardContext } from "@/store/useDashboardStore";

const EarnsPerDay = dynamic(() => import("@/components/structures/Dashboard/Chart/EarnsPerDay"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full" />,
});

const CompareShifts = dynamic(
  () => import("@/components/structures/Dashboard/Chart/CompareShifts"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-40 w-full" />,
  }
);

const ChartEmpty = dynamic(() => import("@/components/structures/Dashboard/Chart/Empty"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full" />,
});

const CarouselContent = dynamic(
  () => import("@/components/ui/Carousel").then((mod) => mod.CarouselContent),
  {
    ssr: false,
  }
);

const CarouselItem = dynamic(
  () => import("@/components/ui/Carousel").then((mod) => mod.CarouselItem),
  {
    ssr: false,
  }
);

function Content() {
  const { user } = useDashboard();

  return (
    <CarouselContent>
      <ChartEmpty data={user?.shifts}>
        <CarouselItem>
          <Text gradient="secondary" classes="mb-2 text-lg">
            Earnings per day
          </Text>
          <EarnsPerDay user={user} />
        </CarouselItem>
      </ChartEmpty>
      <ChartEmpty data={user?.shifts}>
        <CarouselItem>
          <Text gradient="secondary" classes="mb-2 text-lg">
            Compare shifts earnings
          </Text>
          <CompareShifts user={user} />
        </CarouselItem>
      </ChartEmpty>
    </CarouselContent>
  );
}

export default Content;
