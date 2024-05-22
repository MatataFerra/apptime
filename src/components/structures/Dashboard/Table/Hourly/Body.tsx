"use client";

import { useMemo } from "react";

import { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Hourly/Row";
import TableBody from "@/components/ui/TableBody";

import { useDashboardContext } from "@/store/useDashboardStore";

function HourlyBody() {
  const { user } = useDashboardContext((state) => state);
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
