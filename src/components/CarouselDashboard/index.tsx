"use client";

import { useMemo } from "react";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";

import { LocaleParams } from "@/types";

import Card from "@/components/ui/Card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/Carousel";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useDashboardContext } from "@/store/useDashboardStore";

type Props = {
  params: LocaleParams;
};

type Dash = {
  shiftsLen: number;
  hoursWorked: number;
  averageHoursWorkedPerDay: number;
  hourValue: number;
  lastDayRegistered: string;
  estimatedWeeklyEarnings: number;
};

function CarouselDashboard({ params }: Props) {
  const { user } = useDashboardContext((state) => state);
  const {
    shiftsLen,
    lastDayRegistered,
    averageHoursWorkedPerDay,
    estimatedWeeklyEarnings,
    hourValue,
    hoursWorked,
  } = useMemo<Dash>(() => {
    if (!user)
      return {
        shiftsLen: 0,
        hoursWorked: 0,
        averageHoursWorkedPerDay: 0,
        hourValue: 0,
        lastDayRegistered: "",
        estimatedWeeklyEarnings: 0,
      };

    return new Dashboard(user).dashboardData();
  }, [user]);

  const humanizedLastDayRegistered = useMemo(
    () =>
      new DateHumanizer("short").humanizeDate(new Date(lastDayRegistered), {
        locale: params.locale,
      }),
    [lastDayRegistered, params.locale]
  );

  const CARDS_CONTENT = useMemo(
    () => ({
      shiftsLen: {
        title: "Total shifts saved",
        value: shiftsLen,
      },
      lastDayRegistered: {
        title: "Last day registered",
        value: humanizedLastDayRegistered,
      },
      averageHoursWorkedPerDay: {
        title: "Average hours p/day",
        value: averageHoursWorkedPerDay,
      },
      estimatedWeeklyEarnings: {
        title: "Weekly earnings",
        value: `$${estimatedWeeklyEarnings.toFixed(2)}`,
      },
      hourValue: {
        title: "Hour value",
        value: hourValue,
      },
      hoursWorked: {
        title: "Hours worked",
        value: hoursWorked,
      },
    }),
    [
      shiftsLen,
      humanizedLastDayRegistered,
      averageHoursWorkedPerDay,
      estimatedWeeklyEarnings,
      hourValue,
      hoursWorked,
    ]
  );

  return (
    <Stack orientation="horizontal" as="header">
      <Carousel
        opts={{
          align: "center",
          containScroll: "trimSnaps",
          dragFree: true,
          dragThreshold: 0.1,
        }}
        className="w-full max-w-sm"
      >
        <CarouselContent>
          {Object.keys(CARDS_CONTENT).map((key, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <Card>
                <Text classes="text-pretty text-sm">
                  {CARDS_CONTENT[key as keyof typeof CARDS_CONTENT].title}
                </Text>
                <Text
                  classes={`text-wrap text-2xl font-bold ${key === "estimatedWeeklyEarnings" && "text-base"}`}
                >
                  {String(CARDS_CONTENT[key as keyof typeof CARDS_CONTENT].value)}
                </Text>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </Stack>
  );
}

export default CarouselDashboard;
