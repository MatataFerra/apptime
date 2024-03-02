import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ChartLegend from "@/components/ui/ChartLegend";

import { type Color, isGradient } from "@/utils/helpers/colorOrGradient";

import BarGradient from "../BarGradient";

type Props = {
  data: any[] | Record<string, any>[] | undefined;
  legend: string;
  color: Color;
  barColor?: `#${string}`;
};

function CustomTooltip({ active, payload, label, legend }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col divide-y-2 rounded-lg bg-white p-4 shadow-lg">
        <p className="py-2 text-base text-gray-700">{label}</p>
        <p className="py-2 text-sm text-gray-900">{`${legend}: $${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
}

function Chart(props: Props) {
  const { data, legend, color, barColor } = props;
  let dataKey = "";
  let xAxis;

  if (Array.isArray(data)) {
    dataKey = Object.keys(data[0])[1];
    xAxis = Object.keys(data[0])[0];
  }

  const gradient = isGradient(color);
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
        <Tooltip cursor={{ fill: "#e6faffb2" }} content={<CustomTooltip legend={legend} />} />
        <Legend
          content={<ChartLegend legend={legend} color={gradient ? color : "bg-blue-500"} />}
          margin={{ top: 8 }}
        />
        {gradient ? (
          <Bar dataKey={dataKey} label={false} shape={<BarGradient from={"#"} to={"#"} />} />
        ) : (
          <Bar dataKey={dataKey} label={false} fill={barColor ? barColor : "#2196f3"} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Chart;
