"use client";

import { useState } from "react";

import EarnsPerDay from "@/components/Charts/EarnsPerDay";
import EarnsPerMonth from "@/components/Charts/EarnsPerMonth";
import Button from "@/components/ui/Button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";
import { useDot } from "@/hooks/useDot";

import { useDashboardContext } from "@/store/useDashboardStore";

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
          <CarouselItem>
            <Text variant="gradient" classes={`mb-2 text-lg ${GRADIENTS.gradient_1}`}>
              Earnings per month (year: {new Date().getFullYear().toString()})
            </Text>
            <EarnsPerMonth user={user} />
          </CarouselItem>
          <CarouselItem>
            <Text variant="gradient" classes={`mb-2 text-lg ${GRADIENTS.gradient_2}`}>
              Earnings per day
            </Text>
            <EarnsPerDay user={user} />
          </CarouselItem>
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
