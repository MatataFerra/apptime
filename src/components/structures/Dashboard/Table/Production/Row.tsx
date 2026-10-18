"use client";

import { useCallback } from "react";

import { Production } from "@prisma/client";

import ShiftService from "@/services/Shift";

import Content from "@/components/structures/Dashboard/Table/Dialog/Content";
import Dialog from "@/components/structures/Dashboard/Table/Dialog/Dialog";
import Icon from "@/components/ui/Icons";
import TableElement from "@/components/ui/TableElement";

import useHumanizeDate from "@/hooks/useHumanizeDate";

import { useDashProductionStore } from "@/store/useDashProductionStore";

function ProductionRow({ shift }: { shift: Production }) {
  const shortDate = useHumanizeDate({ date: shift.startDate, typeFormat: "short" });
  const { delete: deleteProduction, reset } = useDashProductionStore();

  const calculateEarnings = useCallback((shift: Production) => {
    return new ShiftService({
      itemValue: shift.itemValue,
      itemQuantity: shift.itemQuantity,
      publicHolidayWorked: shift.publicHolidayWorked,
    }).calculateEarnings();
  }, []);

  return (
    <Dialog
      title="Info about this shift"
      delete={deleteProduction}
      reset={reset}
      shift={shift}
      type="production"
      content={<Content shift={shift} />}
    >
      <TableElement as="tr" type="tr">
        <TableElement>{shortDate}</TableElement>
        <TableElement>{shift?.itemQuantity ? shift.itemQuantity : "..."}</TableElement>
        <TableElement>${calculateEarnings(shift).toFixed(2)}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? <Icon.star className="text-accent" /> : null}
        </TableElement>
      </TableElement>
    </Dialog>
  );
}

export default ProductionRow;
