"use client";

import { useEffect, useMemo } from "react";

import type { Production } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Row from "@/components/structures/Dashboard/Table/Production/Row";
import TableBody from "@/components/ui/TableBody";

import useDashboard from "@/hooks/useDashboard";
import useProductionShifts from "@/hooks/useProductionShifts";

import { useDashProductionStore } from "@/store/useDashProductionStore";

function ProductionBody() {
  const { setInitialProductions, productions } = useDashProductionStore();
  const { isDateFiltered } = useDashboard();
  const { data, isLoading } = useProductionShifts();

  useEffect(() => {
    if (isLoading) return;
    if (isEmpty(data)) return;
    if (isDateFiltered) return;

    setInitialProductions(data);
  }, [data, isDateFiltered, isLoading, setInitialProductions]);

  const productionShifts = useMemo(() => {
    return productions ? productions : [];
  }, [productions]);

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
