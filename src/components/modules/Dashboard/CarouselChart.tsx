"use client";

import { useState } from "react";

import { Shift } from "@prisma/client";
import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import { type CarouselApi } from "@/components/ui/Carousel";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";
import { useDot } from "@/hooks/useDot";

import { useDashboardContext } from "@/store/useDashboardStore";

const EarnsPerDay = dynamic(() => import("@/components/structures/Dashboard/Chart/EarnsPerDay"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full" />,
});

const ChartEmpty = dynamic(() => import("@/components/structures/Dashboard/Chart/Empty"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full" />,
});

const Carousel = dynamic(() => import("@/components/ui/Carousel").then((mod) => mod.Carousel), {
  ssr: false,
  loading: () => <Skeleton classes="mx-auto mt-8 h-full w-full max-w-xl" />,
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

const CarouselNext = dynamic(
  () => import("@/components/ui/Carousel").then((mod) => mod.CarouselNext),
  {
    ssr: false,
    loading: () => <Skeleton classes="size-8 rounded-full" />,
  }
);

const CarouselPrevious = dynamic(
  () => import("@/components/ui/Carousel").then((mod) => mod.CarouselPrevious),
  {
    ssr: false,
    loading: () => <Skeleton classes="size-8 rounded-full" />,
  }
);

function CarouselChart() {
  const { user } = useDashboardContext((state) => state);
  const [api, setApi] = useState<CarouselApi>();
  const { scrollSnaps, selectedIndex } = useDot(api);
  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          containScroll: "trimSnaps",
          dragFree: true,
          dragThreshold: 0.1,
        }}
        className="mx-auto mt-8 h-full w-full max-w-xl"
      >
        <CarouselContent>
          <ChartEmpty data={user?.shifts as unknown as Shift[]}>
            <CarouselItem>
              <Text gradient="secondary" classes="mb-2 text-lg">
                Earnings per day
              </Text>
              <EarnsPerDay user={user} />
            </CarouselItem>
          </ChartEmpty>
        </CarouselContent>
        <Stack
          as="footer"
          orientation="horizontal"
          classes="px-2"
          alignItems="center"
          justifyContent="between"
        >
          <Stack as="div" alignItems="center">
            <CarouselPrevious
              className="group static size-8 translate-y-0 bg-black md:size-12"
              color="text-white group-hover:text-black transition-all"
            />
            <CarouselNext
              className="group static size-8 translate-y-0 bg-black md:size-12"
              color="text-white group-hover:text-black transition-all"
            />
          </Stack>
          <Stack orientation="horizontal" as="div">
            {scrollSnaps.map((_, index) => (
              <Button
                variant="outlined"
                key={index}
                classes={cn(
                  "size-4 cursor-default rounded-full border border-transparent bg-gray-300 p-0",
                  index === selectedIndex ? " border-gray-600 bg-gray-500" : ""
                )}
              />
            ))}
          </Stack>
        </Stack>
      </Carousel>
    </>
  );
}

export default CarouselChart;
