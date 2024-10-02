"use client";

import type { Production } from "@prisma/client";

import ShiftService from "@/services/Shift";

import TableElement from "@/components/ui/TableElement";

import { useDashProductionStore } from "@/store/useDashProductionStore";

function FooterValues() {
  const { productions } = useDashProductionStore();
  function calculateEarnings(shift: Production) {
    return new ShiftService({
      itemQuantity: shift?.itemQuantity ?? 0,
      itemValue: shift?.itemValue ?? 0,
      publicHolidayWorked: shift?.publicHolidayWorked ?? false,
    }).calculateEarnings();
  }

  function totalEarnings() {
    return productions?.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumProduction() {
    return productions?.reduce((acc, shift) => {
      return acc + (shift?.itemQuantity ? shift.itemQuantity : 0);
    }, 0);
  }

  return (
    <>
      <TableElement>{`${sumProduction()?.toFixed(1)}`}</TableElement>
      <TableElement>${`${totalEarnings()?.toFixed(2)}`}</TableElement>
    </>
  );
}

export default FooterValues;
