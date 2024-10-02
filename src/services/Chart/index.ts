import { isWithinInterval } from "date-fns";
import groupBy from "lodash/groupBy";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import type { EarnsMonthData, HourlyType, ProductionType } from "@/types";

import { MONTHS } from "@/utils/constants";
import { isProductionShift } from "@/utils/helpers/isProductionShift";

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
  hourly: HourlyType[];
  production: ProductionType[];
  type: "hourly" | "production" = "hourly";

  constructor(
    hourly: HourlyType[],
    production: ProductionType[],
    type: "hourly" | "production" = "hourly"
  ) {
    this.hourly = hourly;
    this.production = production;
    this.type = type;
  }

  format(shifts: HourlyType[] | ProductionType[], type: "hourly" | "production") {
    return shifts.map((shift) => ({
      ...shift,
      type,
    }));
  }

  get merge() {
    return [...this.format(this.hourly, "hourly"), ...this.format(this.production, "production")];
  }

  get groupByDays() {
    const shortDates = this.sortShifts?.map((shift) => ({
      ...shift,
      shortDate: new DateHumanizer("short")
        .humanizeDate(new Date(shift.startDate))
        .split(" ")
        .join("_"),
      type: shift.type,
    }));

    const group = groupBy(shortDates, "shortDate");
    return group;
  }

  get shiftsByType() {
    return this[this.type] ?? [];
  }

  get sortShifts() {
    return ShiftService.sortAllShifts(this.merge, { desc: false });
  }

  get groupByMonths() {
    return ShiftService.groupShiftsByMonths(this.shiftsByType);
  }

  /**
   * @description perior function sets the edges for the shifts
   * @param start Start date to set the period
   * @param end End date to set the perior
   */
  period(start: Date, end: Date) {
    const hourly = this?.hourly
      ?.map((shift) => {
        const isInInterval = isWithinInterval(new Date(shift.startDate), {
          start,
          end,
        });
        if (isInInterval) return shift;

        return null;
      })
      .filter((s) => s !== null);

    const production = this?.production
      ?.map((shift) => {
        const isInInterval = isWithinInterval(new Date(shift.startDate), {
          start,
          end,
        });
        if (isInInterval) return shift;

        return null;
      })
      .filter((s) => s !== null);

    if (this?.hourly && hourly) {
      this.hourly = hourly;
    }

    if (this?.production && production) {
      this.production = production;
    }

    return this;
  }

  earnsPerDay() {
    const data = this.groupByDays
      ? Object.keys(this.groupByDays).map((day) => {
          const { hourly, production } = this.groupByDays[day].reduce(
            (acc, shift) => {
              const earnings = new ShiftService(shift).calculateEarnings();

              if (isProductionShift(shift)) {
                acc.production += earnings; // Sumar a producción
              } else {
                acc.hourly += earnings; // Sumar a hourly
              }

              return acc;
            },
            { hourly: 0, production: 0 } // Inicializar acumuladores
          );

          return {
            date: day.replace(/_/g, " "),
            hourly: hourly.toFixed(2), // Formatear a dos decimales
            production: production.toFixed(2), // Formatear a dos decimales
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
