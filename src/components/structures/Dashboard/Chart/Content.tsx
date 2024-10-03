"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

const EarnsPerDay = dynamic(() => import("@/components/structures/Dashboard/Chart/EarnsPerDay"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full" />,
});

const ChartEmpty = dynamic(() => import("@/components/structures/Dashboard/Chart/Empty"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full" />,
});

function Content() {
  const { data: production } = useProductionShifts();
  const { data: hourly } = useHourlyShifts();

  const merge = [...(hourly ?? []), ...(production ?? [])];

  return (
    <ChartEmpty data={merge}>
      <EarnsPerDay />
    </ChartEmpty>
  );
}

export default Content;
