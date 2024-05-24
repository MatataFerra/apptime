import { FULL_MONTHS_NAMES, TYPE_SHIFT } from "@/utils/constants";

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
function CustomChartTooltip({ active, payload, label, legend, customLegend, showDates }: any) {
  if (active && payload && payload.length) {
    const { dates, shiftsWorked, type } = payload[0].payload;

    const sumValue = payload.reduce((acc: number, curr: any) => {
      if (typeof curr.value === "string") return;

      return acc + curr.value;
    }, 0);

    const findMonthName = FULL_MONTHS_NAMES.findIndex(
      (month) => month.toLowerCase().slice(0, 3) === label.toLowerCase()
    );

    return (
      <div className="flex flex-col divide-y-2 rounded-lg bg-white p-4 shadow-lg">
        <p className="w-full py-1 text-base text-gray-700">
          {findMonthName !== -1 ? FULL_MONTHS_NAMES[findMonthName] : label}
        </p>
        {customLegend ? (
          <>{customLegend}</>
        ) : (
          <div>
            <p className="text-md w-full py-1 text-gray-900">{`${legend}: $${sumValue.toFixed(2)} `}</p>
            <p className="w-full text-sm text-gray-800">{`${findMonthName !== -1 ? `Number of shifts worked: ${shiftsWorked}` : ""}`}</p>
            {showDates && (
              <ul className="w-full list-inside list-disc text-sm text-violet-600">
                {dates.map(({ date, id }: { date: string; id: number }) => (
                  <li key={id}>{`${date}`}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default CustomChartTooltip;
