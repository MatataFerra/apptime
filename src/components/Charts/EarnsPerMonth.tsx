"use client";

import ChartService from "@/services/Chart";
import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Chart from "@/components/ui/Chart";

import { useDashboardContext } from "@/store/useDashboardStore";

// Override console.error
// This is a hack to suppress the warning about missing defaultProps in recharts library as of version 2.12
// @link https://github.com/recharts/recharts/issues/3615
// eslint-disable-next-line no-console
const error = console.error;
// eslint-disable-next-line no-console
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

function EarnsPerMonth() {
  const { user, initialShifts } = useDashboardContext((state) => state);
  const group = new ChartService(initialShifts ?? []).groupByMonths; // [ "Jan": [{}, {}], "Feb": [{}, {}]

  const earningsByMonthData = Object.entries(group ?? {}).map(([month, shifts]) => {
    const earnings = shifts
      .filter((shift) => shift.isClosed)
      .map((shift) => ShiftService.calculateEarnings({ shift, profile: user?.profile! }));

    return {
      month,
      earnings: earnings.reduce((acc, val) => acc + val, 0),
      dates: ShiftService.shiftsSorted(shifts, { desc: false })?.map((shift) => {
        return {
          date: `${new DateHumanizer("short").humanizeDate(new Date(shift.startDate))} - hours: ${ShiftService.differenceInHHmm(shift.startDate, shift?.endDate ?? "").text}`,
          id: shift.id,
        };
      }),
      shiftsWorked: shifts.length,
    };
  });

  const earnsByMonthSortedData = ChartService.sortEarnsPerMonth(earningsByMonthData);

  return (
    <Chart
      data={earnsByMonthSortedData}
      legend="Payment per Month"
      color="bg-violet-800"
      showDates
    />
  );
}

export default EarnsPerMonth;
