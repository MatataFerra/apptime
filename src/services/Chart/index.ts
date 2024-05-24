import { Hourly, Production, Shift } from "@prisma/client";
import { isSameDay } from "date-fns";
import { groupBy } from "lodash";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import type { EarnsMonthData } from "@/types";

import { MONTHS } from "@/utils/constants";
import { isProductionShift } from "@/utils/helpers/isProductionShift";

type Merge = (Hourly | Production)[];

type Shifts =
  | (Shift & {
      hourly: Hourly[];
      production: Production[];
    })
  | null
  | undefined;

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
  shifts: Shifts;
  type: "hourly" | "production" = "hourly";

  constructor(shifts: Shifts, type: "hourly" | "production" = "hourly") {
    this.shifts = shifts;
    this.type = type;
  }

  get merge() {
    return [...(this.shifts?.hourly ?? []), ...(this.shifts?.production ?? [])].flat();
  }

  get groupByDays() {
    const shortDates = this.sortShifts?.map((shift) => ({
      ...shift,
      shortDate: new DateHumanizer("short")
        .humanizeDate(new Date(shift.startDate))
        .split(" ")
        .join("_"),
    }));
    return groupBy(shortDates, "shortDate");
  }

  get shiftsByType() {
    return this.shifts?.[this.type] ?? [];
  }

  get sortShifts() {
    return ShiftService.sortAllShifts(this.merge, { desc: false });
  }

  get groupByMonths() {
    return ShiftService.groupShiftsByMonths(this.shiftsByType);
  }

  earnsPerDay() {
    const data = this.groupByDays
      ? Object.keys(this.groupByDays).map((day) => {
          const earnings = this.groupByDays[day]?.reduce((acc, shift) => {
            return acc + new ShiftService(shift).calculateEarnings();
          }, 0);

          return {
            date: day.replace(/_/g, " "),
            earnings,
          };
        })
      : [];

    return data;
  }

  earnsPerType() {
    const data = this.groupByDays
      ? Object.keys(this.groupByDays).map((day) => {
          const earnings = this.groupByDays[day]?.reduce((acc, shift) => {
            return acc + new ShiftService(shift).calculateEarnings();
          }, 0);

          const hourly = this.groupByDays[day]?.reduce((acc, shift) => {
            if (!isProductionShift(shift)) {
              return acc + new ShiftService(shift).calculateEarnings();
            }

            return acc;
          }, 0);

          const production = this.groupByDays[day]?.reduce((acc, shift) => {
            if (isProductionShift(shift)) {
              return acc + new ShiftService(shift).calculateEarnings();
            }

            return acc;
          }, 0);

          return {
            date: day.replace(/_/g, " "),
            earnings: earnings.toFixed(2),
            hourly: hourly ? hourly.toFixed(2) : 0,
            production: production ? production.toFixed(2) : 0,
          };
        })
      : [];

    return data;
  }

  earnsPerMonth() {
    const data = Object.keys(this.groupByMonths ?? {}).map((month: string) => {
      const earnings =
        this.groupByMonths &&
        this.groupByMonths[month]?.reduce((acc, shift) => {
          return acc + new ShiftService(shift).calculateEarnings();
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
