import { Profile, Shift } from "@prisma/client";

import type { EarnsMonthData } from "@/types";

import { MONTHS } from "@/utils/constants";

import DateHumanizer from "../Date";
import ShiftService from "../Shift";

/**
 * @class Chart
 * @description Chart class
 *
 * @method earnsPerDay - Calculate earnings per day
 * @param profile - Profile
 * @method earnsPerMonth - Calculate earnings per month
 * @param profile - Profile
 */

class Chart {
  shifts: Shift[];
  constructor(shifts: Shift[]) {
    this.shifts = shifts;
  }

  get sortShifts() {
    return ShiftService.shiftsSorted(this.shifts, { desc: false });
  }

  get groupByMonths() {
    return ShiftService.groupShiftsByMonths(this.shifts);
  }

  earnsPerDay() {
    const data = this.sortShifts
      ?.filter((shift) => shift.isClosed)
      .map((shift) => ({
        date: new DateHumanizer("short").humanizeDate(new Date(shift.startDate)),
        earnings: ShiftService.calculateEarnings({ shift }),
      }));

    return data;
  }

  earnsPerMonth() {
    const data = Object.keys(this.groupByMonths ?? {}).map((month: string) => {
      const earnings =
        this.groupByMonths &&
        this.groupByMonths[month]?.reduce((acc, shift) => {
          return acc + ShiftService.calculateEarnings({ shift });
        }, 0);

      if (!earnings) return null;

      return {
        month,
        earnings,
      };
    });

    return data;
  }

  static sortEarnsPerMonth(data: EarnsMonthData[]): ({
    month: string;
    earnings: number;
  } | null)[] {
    return data.sort((a: EarnsMonthData, b: EarnsMonthData) => {
      if (!a?.month || !b?.month) return 0;

      const parseMonths = MONTHS.map((month) => month.toLowerCase());
      return (
        parseMonths.indexOf(a.month.toLowerCase()) - parseMonths.indexOf(b.month.toLowerCase())
      );
    });
  }
}

export default Chart;
