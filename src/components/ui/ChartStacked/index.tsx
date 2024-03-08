import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import CustomChartTooltip from "@/components/CustomChartTooltip";

const BAR_COLORS = [
  "#9b59b6", // Morado amapola
  "#2c3e50", // Gris oscuro
  "#1abc9c", // Verde turquesa
  "#e67e22", // Naranja ceniza
  "#ecf0f1", // Gris pálido
  "#27ae60", // Verde esmeralda oscuro
  "#2980b9", // Azul brillante oscuro
  "#c0392b", // Rojo coral oscuro
  "#8e44ad", // Morado amapola oscuro
  "#d35400", // Naranja zanahoria oscuro
  "#16a085", // Verde turquesa oscuro
  "#d35400", // Naranja ceniza oscuro
  "#bdc3c7", // Plata
  "#7f8c8d", // Gris azulado
  "#95a5a6", // Gris claro azulado
  "#34495e", // Azul grisáceo
  "#e74c3c", // Rojo coral oscuro
  "#f1c40f", // Amarillo brillante
  "#2c3e50", // Gris azulado oscuro
  "#bdc3c7", // Gris plateado
  "#3498db", // Azul brillante oscuro
  "#9b59b6", // Morado amapola oscuro
  "#f39c12", // Naranja zanahoria oscuro
  "#1abc9c", // Verde turquesa oscuro
  "#c0392b", // Rojo coral oscuro
  "#27ae60", // Verde esmeralda oscuro
] as const;

type Props = {
  data: any[] | Record<string, any>[] | undefined;
  legend?: string;
  legendCustom?: React.ReactNode;
};

type Data = {
  [key: string]: number | null | undefined;
};

function Chart(props: Props) {
  const { data, legend } = props;
  const newData: Data[] | undefined = data?.map(({ month, ...rest }) => rest);

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
        <XAxis dataKey={"month"} className="mt-8" />
        <YAxis
          label={{
            value: "Earnings ($)",
            angle: -90,
            position: "insideLeft",
          }}
          tickFormatter={(value) => `$${value}`}
        />

        <Tooltip cursor={{ fill: "#e6faffb2" }} content={<CustomChartTooltip legend={legend} />} />

        {newData?.map((date, index) => (
          <Bar
            dataKey={Object.keys(date)[index]}
            stackId="a"
            key={index}
            fill={`${BAR_COLORS[index]}`}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Chart;
