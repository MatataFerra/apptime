import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ColorService from "@/services/Color";

import type { Color } from "@/types";

import CustomChartTooltip from "@/components/CustomChartTooltip";
import BarGradient from "@/components/ui/BarGradient";
import ChartLegend from "@/components/ui/ChartLegend";

type Props = {
  data: any[] | Record<string, any>[] | undefined;
  color: Color;
  legend?: string;
  barColor?: string;
  showDates?: boolean;
  customLegend?: React.ReactNode;
};

function Chart(props: Props) {
  const { data, legend, color, customLegend, showDates } = props;
  let dataKey = "";
  let xAxis;

  if (Array.isArray(data)) {
    dataKey = Object.keys(data[0])[1];
    xAxis = Object.keys(data[0])[0];
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={500}
      className="rounded-lg border border-gray-200 p-4 shadow-input"
    >
      <BarChart
        width={150}
        height={40}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis dataKey={xAxis} className="mt-8" />
        <YAxis
          label={{
            value: "Earnings ($)",
            angle: -90,
            position: "insideLeft",
          }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ fill: "#e6faffb2" }}
          content={
            <CustomChartTooltip legend={legend} customLegend={customLegend} showDates={showDates} />
          }
        />
        <Legend
          content={<ChartLegend legend={legend} color={ColorService.getColor(color)} />}
          margin={{ top: 8 }}
        />
        {ColorService.isGradient(color) ? (
          <Bar
            dataKey={dataKey}
            label={false}
            shape={
              <BarGradient
                from={ColorService.getColor(color, { hex: true }).from}
                to={ColorService.getColor(color, { hex: true }).to}
              />
            }
          />
        ) : (
          <Bar
            dataKey={dataKey}
            label={false}
            fill={color ? ColorService.getColor(color, { hex: true }) : "#2196f3"}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Chart;
