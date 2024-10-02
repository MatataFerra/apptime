"use client";

import { useEffect, useMemo } from "react";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Hourly/Row";
import TableBody from "@/components/ui/TableBody";

import useDashboard from "@/hooks/useDashboard";
import useHourlyShifts from "@/hooks/useHourlyShifts";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";

function HourlyBody() {
  const { setInitialHourlies, hourly } = useDashHourlyStore();
  const { data, isLoading } = useHourlyShifts();
  const { isDateFiltered } = useDashboard();

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;
    if (isDateFiltered) return;

    setInitialHourlies(data);
  }, [data, isDateFiltered, isLoading, setInitialHourlies]);

  const hourlyWorkedShift = useMemo(() => {
    return hourly ? hourly : [];
  }, [hourly]);

  return (
    <TableBody>
      {isLoading ? (
        <tr>
          <td colSpan={4} className="p-8 text-center">
            Waiting for data...
          </td>
        </tr>
      ) : isEmpty(hourlyWorkedShift) ? (
        <tr>
          <td colSpan={4} className="p-8 text-center">
            No shifts found
          </td>
        </tr>
      ) : (
        ShiftService.shiftsSorted(hourlyWorkedShift, { desc: false })
          ?.filter((shift) => shift.isClosed)
          .map((shift) => <Row key={shift.id} shift={shift as Hourly} />)
      )}
    </TableBody>
  );
}

export default HourlyBody;
