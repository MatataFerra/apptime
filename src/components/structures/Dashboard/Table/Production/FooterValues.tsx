"use client";

import type { Production } from "@prisma/client";

import ProductionService from "@/services/Shift/Production";

import TableElement from "@/components/ui/TableElement";

import useDashboard from "@/hooks/useDashboard";

function FooterValues() {
  const { user } = useDashboard();
  function calculateEarnings(shift: Production) {
    return ProductionService.earnings({
      holidayPayRate: shift?.holidayPayRate ?? 0,
      itemQuantity: shift?.itemQuantity ?? 0,
      itemValue: shift?.itemValue ?? 0,
      publicHolidayWorked: shift?.publicHolidayWorked ?? false,
    });
  }

  function totalEarnings() {
    return user?.shifts?.production?.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumProduction() {
    return user?.shifts?.production?.reduce((acc, shift) => {
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
