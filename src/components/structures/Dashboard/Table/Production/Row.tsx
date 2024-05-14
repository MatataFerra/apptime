"use client";

import { useCallback } from "react";

import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";

import Content from "@/components/structures/Dashboard/Table/Dialog/Content";
import Dialog from "@/components/structures/Dashboard/Table/Dialog/Dialog";
import Icon from "@/components/ui/Icons";
import TableElement from "@/components/ui/TableElement";

import useHumanizeDate from "@/hooks/useHumanizeDate";

function ProductionRow({ shift }: { shift: Shift }) {
  const shortDate = useHumanizeDate({ date: shift.startDate, typeFormat: "short" });

  const calculateEarnings = useCallback((shift: Shift) => {
    return ShiftService.calculateProductionEarnings({
      itemValue: shift.itemValue,
      itemQuantity: shift.itemQuantity,
      holidayPayRate: shift.holidayPayRate,
      publicHolidayWorked: shift.publicHolidayWorked,
    });
  }, []);

  return (
    <Dialog title="Info about this shift" shift={shift} content={<Content shift={shift} />}>
      <TableElement as="tr" type="tr">
        <TableElement>{shortDate}</TableElement>
        <TableElement>{shift?.itemQuantity ? shift.itemQuantity : "..."}</TableElement>
        <TableElement>${calculateEarnings(shift).toFixed(2)}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? <Icon.star style={{ color: "#00f5d4" }} /> : null}
        </TableElement>
      </TableElement>
    </Dialog>
  );
}

export default ProductionRow;
