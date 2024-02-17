"use client";

import ShiftService from "@/services/Shift";

import TableElement from "@/components/TableElement";

import { useDashboardContext } from "@/store/useDashboardStore";

function TableBody() {
  const { user } = useDashboardContext((state) => state);

  return (
    <tbody>
      {ShiftService.shiftsSorted(user?.shifts, { desc: false })?.map((shift) => (
        <TableElement key={shift.id} shift={shift} />
      ))}
    </tbody>
  );
}

export default TableBody;
