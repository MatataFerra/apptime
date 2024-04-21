"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import TablePerProductionRow from "@/components/TablePerProductionRow";
import TableBody from "@/components/ui/TableBody";

import { useDashboardContext } from "@/store/useDashboardStore";

function TablePerProductionBody() {
  const { user } = useDashboardContext((state) => state);
  const productionShifts = useMemo(() => {
    return user?.shifts?.filter((shift) => shift.typeShift === "PRODUCTION");
  }, [user?.shifts]);

  return (
    <TableBody>
      {isEmpty(productionShifts) ? (
        <tr>
          <td colSpan={4} className="text-center">
            No shifts found
          </td>
        </tr>
      ) : (
        ShiftService.shiftsSorted(productionShifts, { desc: false })
          ?.filter((shift) => shift.isClosed)
          .map((shift) => <TablePerProductionRow key={shift.id} shift={shift} />)
      )}
    </TableBody>
  );
}

export default TablePerProductionBody;
