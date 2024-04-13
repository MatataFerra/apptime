"use client";

import { useCallback } from "react";

import { Shift } from "@prisma/client";
import { useLocale } from "next-intl";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { Locale } from "@/types";

import Icon from "@/components/ui/Icons";
import TableElement from "@/components/ui/TableElement";

import TableDialog from "../TableDialog";
import TableDialogContent from "../TableDialogContent";

function TableHistoryRow({ shift }: { shift: Shift }) {
  const locale = useLocale() as Locale;

  const calculateEarnings = useCallback((shift: Shift) => {
    return ShiftService.calculateEarnings({ shift });
  }, []);

  function shortDate(date: string) {
    const short = new DateHumanizer("short").humanizeDate(new Date(date), {
      locale: locale,
    });

    return short;
  }

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
        <TableElement>{shortDate(shift.startDate)}</TableElement>
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
