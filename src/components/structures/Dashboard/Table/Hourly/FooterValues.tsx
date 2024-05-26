"use client";

import { Hourly } from "@prisma/client";

import ShiftService from "@/services/Shift";

import TableElement from "@/components/ui/TableElement";

import useDashboard from "@/hooks/useDashboard";

import { useDashboardContext } from "@/store/useDashboardStore";

function FooterValues() {
  const { user } = useDashboard();
  function calculateEarnings(shift: Hourly) {
    return new ShiftService(shift).calculateEarnings();
  }
  function getHours(minutes: number) {
    return ShiftService.convertAmountInDecimal(minutes);
  }

  function totalEarnings() {
    return user?.shifts?.hourly.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumHours() {
    return user?.shifts?.hourly.reduce((acc, shift) => {
      return acc + (shift?.amount ? getHours(shift?.amount ?? 0) : 0);
    }, 0);
  }

  return (
    <>
      <TableElement>{`${sumHours()?.toFixed(2)}`}h</TableElement>
      <TableElement>${`${totalEarnings()?.toFixed(2)}`}</TableElement>
    </>
  );
}

export default FooterValues;
