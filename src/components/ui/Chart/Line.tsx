import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: any[] | Record<string, any>[] | undefined;
};

function ChartLine({ data }: Props) {
  return (
    <ResponsiveContainer
      width="100%"
      height={500}
      className="rounded-lg border border-border bg-surface p-4"
    >
      <LineChart
        width={150}
        height={40}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis dataKey="date" className="mt-8" />
        <YAxis
          dataKey="earnings"
          label={{
            value: "Earnings ($)",
            angle: -90,
            position: "insideLeft",
          }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hourly" stroke="var(--chart-1)" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="production" stroke="var(--chart-2)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ChartLine;
