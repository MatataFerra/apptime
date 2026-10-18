"use client";

import { useCallback, useMemo } from "react";

import type { Hourly } from "@prisma/client";
import dynamic from "next/dynamic";

import ShiftService from "@/services/Shift";

import { COLUMNS } from "@/components/modules/Dashboard/TableHistory";
import Icon from "@/components/ui/Icons";
import Skeleton from "@/components/ui/Skeleton";
import TableElement from "@/components/ui/TableElement";

import useHumanizeDate from "@/hooks/useHumanizeDate";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";

const TableDialog = dynamic(() => import("@/components/structures/Dashboard/Table/Dialog/Dialog"), {
  ssr: false,
  loading: () => (
    <TableElement as="tr">
      <TableElement colSpan={COLUMNS.length}>
        <Skeleton classes="h-40 w-full" />
      </TableElement>
    </TableElement>
  ),
});

const TableDialogContent = dynamic(
  () => import("@/components/structures/Dashboard/Table/Dialog/Content"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-20 w-full" />,
  }
);

function HourlyRow({ shift }: { shift: Hourly }) {
  const { delete: deleteHourly, reset } = useDashHourlyStore();

  const shortDate = useHumanizeDate({ date: shift.startDate, typeFormat: "short" });

  const calculateEarnings = useCallback((shift: Hourly) => {
    return new ShiftService(shift).calculateEarnings();
  }, []);

  const getTimeDifference = useMemo(() => {
    return ShiftService.differenceInHHmm(shift.startDate, shift?.endDate);
  }, [shift?.endDate, shift.startDate]);

  return (
    <TableDialog
      title="Info about this shift"
      shift={shift}
      type="hourly"
      delete={deleteHourly}
      reset={reset}
      content={<TableDialogContent shift={shift} />}
    >
      <TableElement as="tr" type="tr">
        <TableElement>{shortDate}</TableElement>
        <TableElement>
          {getTimeDifference.diff ? `${String(getTimeDifference.text)}` : "..."}
        </TableElement>
        <TableElement>${String(calculateEarnings(shift))}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? <Icon.star className="text-accent" /> : null}
        </TableElement>
      </TableElement>
    </TableDialog>
  );
}

export default HourlyRow;
