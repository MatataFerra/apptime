"use client";

import { useMemo } from "react";

import type { Hourly } from "@prisma/client";

import ShiftService from "@/services/Shift";

import TableElement from "@/components/ui/TableElement";

import useDashboard from "@/hooks/useDashboard";

function getHours(shift: Hourly) {
  const getDiff = new ShiftService(shift).differenceInMinsBetweenStartAndEnd().build().amount;
  return getDiff;
}

function FooterValues() {
  const { user } = useDashboard();
  function calculateEarnings(shift: Hourly) {
    return new ShiftService(shift).calculateEarnings();
  }

  const totalEarnings = useMemo(() => {
    return user?.shifts?.hourly.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }, [user?.shifts?.hourly]);

  const sumHours = useMemo(() => {
    return user?.shifts?.hourly.reduce((acc, shift) => {
      return acc + (getHours(shift) ?? 0);
    }, 0);
  }, [user?.shifts?.hourly]);

  return (
    <>
      <TableElement>{`${ShiftService.convertDifferenceInHHmm(sumHours).text}`}</TableElement>
      <TableElement>{`${totalEarnings ? `$${totalEarnings?.toFixed(2)}` : "..."}`}</TableElement>
    </>
  );
}

export default FooterValues;
