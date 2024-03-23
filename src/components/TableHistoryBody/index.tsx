"use client";

import { isEmpty } from "lodash";

import ShiftService from "@/services/Shift";

import TableHistoryRow from "@/components/TableHistoryRow";
import TableBody from "@/components/ui/TableBody";

import { useDashboardContext } from "@/store/useDashboardStore";

function TableHistoryBody() {
  const { user } = useDashboardContext((state) => state);

  return (
    <TableBody>
      {isEmpty(user?.shifts) ? (
        <tr>
          <td colSpan={3} className="text-center">
            No shifts found
          </td>
        </tr>
      ) : (
        ShiftService.shiftsSorted(user?.shifts, { desc: false })?.map((shift) => (
          <TableHistoryRow key={shift.id} shift={shift} />
        ))
      )}
    </TableBody>
  );
}

export default TableHistoryBody;
