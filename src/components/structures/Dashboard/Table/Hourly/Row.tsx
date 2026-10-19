"use client";

import type { Hourly } from "@prisma/client";
import dynamic from "next/dynamic";

import ShiftService from "@/services/Shift";
import { formatMoney } from "@/services/Summary";

import { COLUMNS } from "@/components/modules/Dashboard/TableHistory.lazy";
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

  const earnings = new ShiftService(shift).calculateEarnings();
  const getTimeDifference = ShiftService.differenceInHHmm(shift.startDate, shift?.endDate);

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
        <TableElement>{formatMoney(earnings)}</TableElement>
        <TableElement align="center">
          {shift?.isPublicHoliday ? (
            <span className="inline-flex rounded-full bg-fast-soft px-2 py-0.5 text-xs font-semibold text-fast-ink">
              Holiday
            </span>
          ) : null}
        </TableElement>
      </TableElement>
    </TableDialog>
  );
}

export default HourlyRow;
