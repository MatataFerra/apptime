"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Production/Row";
import TableBody from "@/components/ui/TableBody";

import { useDashboardContext } from "@/store/useDashboardStore";

function ProductionBody() {
  const { user } = useDashboardContext((state) => state);
  const productionShifts = useMemo(() => {
    return user?.shifts?.filter((shift) => shift.typeShift === "PRODUCTION");
  }, [user?.shifts]);

  return (
    <TableBody>
      {isEmpty(productionShifts) ? (
        <tr>
          <td colSpan={4} className="p-8 text-center">
            No shifts found
          </td>
        </tr>
      ) : (
        ShiftService.shiftsSorted(productionShifts, { desc: false })
          ?.filter((shift) => shift.isClosed)
          .map((shift) => <Row key={shift.id} shift={shift} />)
      )}
    </TableBody>
  );
}

export default ProductionBody;
