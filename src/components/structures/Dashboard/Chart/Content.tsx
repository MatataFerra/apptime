"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import useDashboard from "@/hooks/useDashboard";

const EarnsPerDay = dynamic(() => import("@/components/structures/Dashboard/Chart/EarnsPerDay"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full" />,
});

const CompareShifts = dynamic(
  () => import("@/components/structures/Dashboard/Chart/CompareShifts"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-72 w-full" />,
  }
);

const ChartEmpty = dynamic(() => import("@/components/structures/Dashboard/Chart/Empty"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full" />,
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
    <CarouselContent className="h-auto">
      <ChartEmpty data={user?.shifts}>
        <CarouselItem>
          <EarnsPerDay user={user} />
        </CarouselItem>
      </ChartEmpty>
      <ChartEmpty data={user?.shifts}>
        <CarouselItem>
          <CompareShifts user={user} />
        </CarouselItem>
      </ChartEmpty>
    </CarouselContent>
  );
}

export default Content;
