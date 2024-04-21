"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import TableHistoryRow from "@/components/TableHistoryRow";
import TableBody from "@/components/ui/TableBody";

import { useDashboardContext } from "@/store/useDashboardStore";

function TableHistoryBody() {
  const { user } = useDashboardContext((state) => state);
  const hourlyWorkedShift = useMemo(() => {
    return user?.shifts?.filter((shift) => shift.typeShift !== "PRODUCTION");
  }, [user?.shifts]);

  return (
    <TableBody>
      {isEmpty(hourlyWorkedShift) ? (
        <tr>
          <td colSpan={4} className="text-center">
            No shifts found
          </td>
        </tr>
      ) : (
        ShiftService.shiftsSorted(hourlyWorkedShift, { desc: false })
          ?.filter((shift) => shift.isClosed)
          .map((shift) => <TableHistoryRow key={shift.id} shift={shift} />)
      )}
    </TableBody>
  );
}

export default TableHistoryBody;
