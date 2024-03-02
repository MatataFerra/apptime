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

  earnsPerDay(profile: Profile) {
    const data = this.sortShifts?.map((shift) => ({
      date: new DateHumanizer("short").humanizeDate(new Date(shift.startDate)),
      earnings: ShiftService.calculateEarnings({
        shift,
        profile,
      }),
    }));

    return data;
  }

  earnsPerMonth(profile: Profile) {
    const data = Object.keys(this.groupByMonths ?? {}).map((month: string) => {
      const earnings =
        this.groupByMonths &&
        this.groupByMonths[month]?.reduce((acc, shift) => {
          return acc + ShiftService.calculateEarnings({ shift, profile });
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

      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });
  }
}

export default Chart;
