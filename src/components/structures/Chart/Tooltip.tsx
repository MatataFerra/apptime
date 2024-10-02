import { ReactNode } from "react";

type Payload = {
  chartType: undefined;
  color: string;
  dataKey: "hourly" | "production";
  fill: string;
  formatter: undefined;
  hide: false;
  name: "hourly" | "production";
  payload: {
    date: string;
    hourly: string;
    production: string;
    radius: number | number[];
    type: undefined;
    unit: undefined;
    value: string;
  };
};

/**
 * @name CustomChartTooltip
 * @param active
 * @param payload
 * @param label
 * @param legend
 * @param customLegend
 * @param showDates
 * @returns React.ReactNode
 */
function CustomChartTooltip({
  active,
  payload,
  legend = "Total",
  customLegend,
  type,
}: {
  active?: boolean;
  payload?: Payload[];
  customLegend?: ReactNode;
  legend?: string;
  type?: "hourly" | "production";
}) {
  if (active && payload && payload.length) {
    // const { dates, shiftsWorked } = payload[0]?.payload;

    const dataKey = payload.find((data) => data.dataKey === type);

    const sumValue =
      dataKey?.name === "hourly" ? dataKey?.payload?.hourly : dataKey?.payload?.production;

    // const findMonthName = FULL_MONTHS_NAMES.findIndex(
    //   (month) => month.toLowerCase().slice(0, 3) === label.toLowerCase()
    // );

    return (
      <div className="flex flex-col divide-y-2 rounded-lg bg-white p-2 shadow-lg">
        {/* <p className="w-full py-1 text-xs text-gray-700">
          {findMonthName !== -1 ? FULL_MONTHS_NAMES[findMonthName] : label}
        </p> */}
        {customLegend ? (
          <>{customLegend}</>
        ) : (
          <div>
            <p className="text-md w-full py-1 text-gray-900">{`${legend}: $${sumValue} `}</p>
            <p className="w-full text-sm text-gray-800">{`Type: ${dataKey?.name}`}</p>
            {/* {showDates && (
              <ul className="w-full list-inside list-disc text-sm text-violet-600">
                {dates.map(({ date, id }: { date: string; id: number }) => (
                  <li key={id}>{`${date}`}</li>
                ))}
              </ul>
            )} */}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default CustomChartTooltip;
