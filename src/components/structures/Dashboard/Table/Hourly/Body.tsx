"use client";

import { useMemo } from "react";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Hourly/Row";
import TableBody from "@/components/ui/TableBody";

import useDashboard from "@/hooks/useDashboard";

function HourlyBody() {
  const { user } = useDashboard();

  const hourlyWorkedShift = useMemo(() => {
    return user?.shifts?.hourly;
  }, [user?.shifts]);

  return (
    <TableBody>
      {isEmpty(hourlyWorkedShift) ? (
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
