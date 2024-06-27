"use client";

import { useCallback } from "react";

import { Hourly } from "@prisma/client";
import dynamic from "next/dynamic";

import ShiftService from "@/services/Shift";

import Icon from "@/components/ui/Icons";
import Skeleton from "@/components/ui/Skeleton";
import TableElement from "@/components/ui/TableElement";

import useHumanizeDate from "@/hooks/useHumanizeDate";

const TableDialog = dynamic(() => import("@/components/structures/Dashboard/Table/Dialog/Dialog"), {
  ssr: false,
  loading: () => (
    <TableElement as="tr">
      <TableElement>
        <Skeleton classes="h-40 w-full" />
      </TableElement>
    </TableElement>
  ),
});

const TableDialogContent = dynamic(
  () => import("@/components/structures/Dashboard/Table/Dialog/Content"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-40 w-full" />,
  }
);

function HourlyRow({ shift }: { shift: Hourly }) {
  const shortDate = useHumanizeDate({ date: shift.startDate, typeFormat: "short" });

  const calculateEarnings = useCallback((shift: Hourly) => {
    return new ShiftService(shift).calculateEarnings();
  }, []);

  const difference = useCallback((shift: Hourly) => {
    const diff = new ShiftService(shift).differenceInMinsBetweenStartAndEnd().build().amount ?? 0;
    return ShiftService.convertAmountInDecimal(diff);
  }, []);

  return (
    <TableDialog
      title="Info about this shift"
      shift={shift}
      type="hourly"
      content={<TableDialogContent shift={shift} />}
    >
      <TableElement as="tr" type="tr">
        <TableElement>{shortDate}</TableElement>
        <TableElement>{shift?.amount ? `${String(difference(shift))}h` : "..."}</TableElement>
        <TableElement>${String(calculateEarnings(shift))}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? <Icon.star style={{ color: "#00f5d4" }} /> : null}
        </TableElement>
      </TableElement>
    </TableDialog>
  );
}

export default HourlyRow;
