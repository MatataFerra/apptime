"use client";

import { useMemo } from "react";

import { Production } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Production/Row";
import TableBody from "@/components/ui/TableBody";

import useDashboard from "@/hooks/useDashboard";

import { useDashboardContext } from "@/store/useDashboardStore";

function ProductionBody() {
  const { user } = useDashboard();
  const productionShifts = useMemo(() => {
    return user?.shifts?.production;
  }, [user?.shifts?.production]);

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
          .map((shift) => <Row key={shift.id} shift={shift as Production} />)
      )}
    </TableBody>
  );
}

export default ProductionBody;
