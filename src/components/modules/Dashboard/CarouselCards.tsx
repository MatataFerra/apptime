"use client";

import dynamic from "next/dynamic";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";

import { LocaleParams } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

const Card = dynamic(() => import("@/components/ui/Card"), {
  ssr: false,
  loading: () => <Skeleton classes="h-32 w-full" />,
});

const Carousel = dynamic(() => import("@/components/ui/Carousel").then((mod) => mod.Carousel), {
  ssr: false,
  loading: () => <Skeleton classes="mx-auto mt-8 h-40 w-full max-w-[90svw] overflow-hidden" />,
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
    loading: () => <Skeleton classes="basis-1/2 sm:basis-1/3 md:basis-1/5" />,
  }
);

type Props = {
  params: LocaleParams;
};

type DashboardData = {
  title: string;
  value: string | number;
};

function CarouselDashboard({ params }: Props) {
  const { data: hourlies } = useHourlyShifts();
  const { data: productions } = useProductionShifts();
  const defaultValues = {
    shiftsLen: 0,
    hoursWorked: 0,
    averageHoursWorkedPerDay: 0,
    hourValue: 0,
    lastDayRegistered: "",
    estimatedWeeklyEarnings: 0,
  };
  const {
    shiftsLen,
    lastDayRegistered,
    averageHoursWorkedPerDay,
    estimatedWeeklyEarnings,
    hourValue,
    hoursWorked,
  } = !hourlies ? defaultValues : new Dashboard(hourlies, productions).dashboardData();

  const humanizedLastDayRegistered = !!new Date(lastDayRegistered).valueOf()
    ? new DateHumanizer("short").humanizeDate(new Date(lastDayRegistered), {
        locale: params.locale,
      })
    : "No shifts registered.";

  const shiftLen: DashboardData = {
    title: "Total shifts saved",
    value: shiftsLen,
  };

  const lastDay: DashboardData = {
    title: "Last day registered",
    value: humanizedLastDayRegistered,
  };

  const averageHours: DashboardData = {
    title: "Average hours p/day",
    value: `${averageHoursWorkedPerDay}hs.`,
  };

  const estimatedWeekly: DashboardData = {
    title: "Weekly earnings",
    value: `$${estimatedWeeklyEarnings.toFixed(2)}`,
  };

  const hourVal: DashboardData = {
    title: "Hour value",
    value: `$${hourValue}`,
  };

  const hoursWork: DashboardData = {
    title: "Hours worked",
    value: `${hoursWorked}hs.`,
  };

  const CARDS_CONTENT = {
    shiftsLen: shiftLen,
    lastDayRegistered: lastDay,
    averageHoursWorkedPerDay: averageHours,
    estimatedWeeklyEarnings: estimatedWeekly,
    hoursWorked: hoursWork,
  };

  return (
    <>
      <Stack orientation="horizontal" as="header" classes="w-full">
        <Carousel
          opts={{
            align: "center",
            containScroll: "trimSnaps",
            dragFree: true,
            dragThreshold: 0.1,
          }}
          className="w-full max-w-[90svw] overflow-hidden"
        >
          <CarouselContent>
            {Object.keys(CARDS_CONTENT).map((key, index) => (
              <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/5">
                <Card>
                  <Text classes="text-sm text-pretty text-ink-muted">
                    {CARDS_CONTENT[key as keyof typeof CARDS_CONTENT].title}
                  </Text>
                  <Text
                    classes={`figure self-end text-2xl leading-tight font-semibold text-wrap ${key === "lastDayRegistered" ? "text-lg" : ""}`}
                  >
                    {String(CARDS_CONTENT[key as keyof typeof CARDS_CONTENT].value)}
                  </Text>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Stack>
    </>
  );
}

export default CarouselDashboard;
