import { isValid } from "date-fns";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";
import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import Card from "@/components/ui/Card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/Carousel";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  params: LocaleParams;
};

type DashboardData = {
  title: string;
  value: string | number;
};

async function CarouselDashboard({ params }: Props) {
  const user = await UserService.getSessionUser();
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
  } = !user ? defaultValues : new Dashboard(user).dashboardData();

  const humanizedLastDayRegistered = isValid(new Date(lastDayRegistered))
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
    hourValue: hourVal,
    hoursWorked: hoursWork,
  };

  return (
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
