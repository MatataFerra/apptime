import { isThisWeek, isValid, max } from "date-fns";
import isEmpty from "lodash/isEmpty";
import isLodashNan from "lodash/isNaN";

import ShiftService from "@/services/Shift";

import { DAYS, HourlyType, ProductionType } from "@/types/services";

interface DashboardInterface {
  hourly: HourlyType[];
  production: ProductionType[];
  get shiftsLen(): number;
  get hoursWorked(): number;
  get averageHoursWorkedPerDay(): number;
  get lastDayRegistered(): string;
  estimatedWeeklyEarnings({ weekStartsOn }: { weekStartsOn?: keyof typeof DAYS }): number;
  dashboardData(): {
    shiftsLen: number;
    hoursWorked: number;
    averageHoursWorkedPerDay: number;
    hourValue: number;
    lastDayRegistered: string;
    estimatedWeeklyEarnings: number;
  };
}

/**
  @description
  This service is responsible for calculating the dashboard data.
  @param {UserType} user - The user object.
  
  The dashboard data is:
  - amount of saved shifts
  - estimated weekly earnings
  - total hours worked (historical)
  - average hours worked per day (calculation based on total)
  - last day registered

  @returns {Object} - The dashboard data.
*/

class Dashboard implements DashboardInterface {
  hourly: HourlyType[];
  production: ProductionType[];
  constructor(hourly: HourlyType[], production: ProductionType[]) {
    this.hourly = hourly;
    this.production = production;
  }

  get merge() {
    return [...(this?.hourly ?? []), ...(this?.production ?? [])];
  }

  get shiftsLen() {
    if (!this.merge) return 0;

    return this.merge.length;
  }

  get hoursWorked() {
    if (!this.merge) return 0;

    const production = this.production?.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    const hourly = this.hourly?.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    const total = production + hourly;

    return total;
  }

  get averageHoursWorkedPerDay() {
    const total = this.hoursWorked / this.shiftsLen;

    if (isLodashNan(total)) return 0;

    return total;
  }

  get lastProductionShift() {
    if (isEmpty(this.merge)) return null;
    if (isEmpty(this.production)) return null;
    return max(this.production.map((shift) => new Date(shift.startDate)));
  }

  get lastHourlyShift() {
    if (!this.merge) return null;

    return max(this.hourly?.map((shift) => new Date(shift.startDate)));
  }

  get lastDayRegistered() {
    if (!this.merge) return "There is no data";
    if (!this.lastProductionShift && !this.lastHourlyShift) return "There is no data";
    if (!isValid(this.lastProductionShift) && isValid(this.lastHourlyShift))
      return this.lastHourlyShift!.toString();

    if (isValid(this.lastProductionShift) && !isValid(this.lastHourlyShift))
      return this.lastProductionShift!.toString();

    return max([this.lastProductionShift ?? "", this.lastHourlyShift ?? ""]).toString();
  }

  estimatedWeeklyEarnings({ weekStartsOn = "monday" }: { weekStartsOn?: keyof typeof DAYS } = {}) {
    if (!this.merge) return 0;

    const production = this.production?.reduce((acc, shift) => {
      const earnings = new ShiftService(shift).calculateEarnings();

      if (
        isThisWeek(new Date(shift.startDate), {
          weekStartsOn: DAYS[weekStartsOn as keyof typeof DAYS],
        })
      ) {
        acc += earnings;
      }

      return acc;
    }, 0);

    const hourly = this.hourly?.reduce((acc, shift) => {
      const earnings = new ShiftService(shift).calculateEarnings();

      if (
        isThisWeek(new Date(shift.startDate), {
          weekStartsOn: DAYS[weekStartsOn as keyof typeof DAYS],
        })
      ) {
        acc += earnings;
      }

      return acc;
    }, 0);

    return production + hourly;
  }

  dashboardData() {
    return {
      shiftsLen: this.shiftsLen,
      hoursWorked: ShiftService.convertAmountInDecimal(this.hoursWorked),
      averageHoursWorkedPerDay: ShiftService.convertAmountInDecimal(this.averageHoursWorkedPerDay),
      hourValue: 0,
      lastDayRegistered: this.lastDayRegistered,
      estimatedWeeklyEarnings: this.estimatedWeeklyEarnings(),
    };
  }
}

export default Dashboard;
