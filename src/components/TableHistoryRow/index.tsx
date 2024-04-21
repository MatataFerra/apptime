"use client";

import { useCallback } from "react";

import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";

import Icon from "@/components/ui/Icons";
import TableElement from "@/components/ui/TableElement";

import useHumanizeDate from "@/hooks/useHumanizeDate";

import TableDialog from "../TableDialog";
import TableDialogContent from "../TableDialogContent";

function TableHistoryRow({ shift }: { shift: Shift }) {
  const shortDate = useHumanizeDate({ date: shift.startDate, typeFormat: "short" });

  const calculateEarnings = useCallback((shift: Shift) => {
    return ShiftService.calculateEarnings({ shift });
  }, []);

  function getHours(minutes: number) {
    return ShiftService.convertAmountInDecimal(minutes);
  }

  return (
    <TableDialog
      title="Info about this shift"
      shift={shift}
      content={<TableDialogContent shift={shift} />}
    >
      <TableElement as="tr" type="tr">
        <TableElement>{shortDate}</TableElement>
        <TableElement>
          {shift?.amount ? `${String(getHours(shift?.amount ?? 0))}h` : "..."}
        </TableElement>
        <TableElement>${String(calculateEarnings(shift))}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? <Icon.star style={{ color: "#00f5d4" }} /> : null}
        </TableElement>
      </TableElement>
    </TableDialog>
  );
}

export default TableHistoryRow;
