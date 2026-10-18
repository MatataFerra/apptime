"use client";

import isEmpty from "lodash/isEmpty";
import { useLocale } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { Locale } from "@/types";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Chart/card";

import { CHART_MONTH } from "@/utils/constants";

const chartConfig = {
  hourly: {
    label: "Hourly",
    color: "var(--chart-1)",
  },
  production: {
    label: "Production",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type Props = {
  data: any[] | Record<string, any>[];
};

export default function BarChartComponent({ data }: Props) {
  const locale = useLocale() as Locale;
  let dataKeyHourly = "";
  let dataKeyProduction = "";
  let xAxis;

  if (Array.isArray(data) && !isEmpty(data)) {
    dataKeyHourly = Object?.keys(data[0])[1];
    dataKeyProduction = Object?.keys(data[0])[2];
    xAxis = Object?.keys(data[0])[0];
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Earns per day</CardTitle>
        <CardDescription>
          Shifts up to{" "}
          <span className="border-b border-b-border font-bold">{`${data.at(-1).date}`}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxis}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const dateSplitted: string[] = value.split(" ");
                const day = dateSplitted[0];
                const getMonth = dateSplitted
                  .map((s) => {
                    return CHART_MONTH[locale].find(
                      (month) => month.toLowerCase() === s.toLowerCase()
                    );
                  })
                  .filter((d) => d);

                return `${day}-${getMonth}`;
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey={dataKeyHourly}
              fill="var(--color-hourly)"
              radius={[0, 0, 2, 2]}
              stackId="a"
            />
            <Bar
              dataKey={dataKeyProduction}
              fill="var(--color-production)"
              radius={[0, 0, 2, 2]}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
