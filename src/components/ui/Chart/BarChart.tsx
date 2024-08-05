"use client";

import isEmpty from "lodash/isEmpty";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import CustomChartTooltip from "@/components/structures/Chart/Tooltip";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/Chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Chart/card";

import { MONTHS } from "@/utils/constants";

const chartConfig = {
  desktop: {
    label: "earnings",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  data: any[] | Record<string, any>[];
  legend?: string;
  showDates?: boolean;
  customLegend?: React.ReactNode;
};

export default function BarChartComponent({ data, legend, showDates, customLegend }: Props) {
  let dataKey = "";
  let xAxis;

  if (Array.isArray(data) && !isEmpty(data)) {
    dataKey = Object?.keys(data[0])[1];
    xAxis = Object?.keys(data[0])[0];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earns per day</CardTitle>
        <CardDescription>Between all shifts during: {new Date().getFullYear()}</CardDescription>
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
                    return MONTHS.find((month) => month.toLowerCase() === s.toLowerCase());
                  })
                  .filter((d) => d);

                return `${day}-${getMonth}`;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <CustomChartTooltip
                  legend={legend}
                  customLegend={customLegend}
                  showDates={showDates}
                />
              }
            />
            <Bar dataKey={dataKey} fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
