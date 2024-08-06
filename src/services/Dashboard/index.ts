import { isThisWeek, isValid, max } from "date-fns";
import isLodashNan from "lodash/isNaN";

import ShiftService from "@/services/Shift";

import { type DashboardInterface, DAYS, type UserType } from "@/types/services";

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
  user: UserType;
  constructor(user: UserType) {
    this.user = user;
  }

  get shiftsLen() {
    if (!this.user.shifts) return 0;
    const production = this.user.shifts.production.length;
    const hourly = this.user.shifts.hourly.length;
    return production + hourly;
  }

  get hoursWorked() {
    if (!this.user.shifts) return 0;

    const production = this.user.shifts.production.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    const hourly = this.user.shifts.hourly.reduce((acc, shift) => {
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
    if (!this.user?.shifts) return null;
    return max(this.user.shifts.production.map((shift) => new Date(shift.startDate)));
  }

  get lastHourlyShift() {
    if (!this.user?.shifts) return null;

    return max(this.user?.shifts?.hourly.map((shift) => new Date(shift.startDate)));
  }

  get lastDayRegistered() {
    if (!this.user?.shifts) return "There is no data";
    if (!this.lastProductionShift && !this.lastHourlyShift) return "There is no data";
    if (!isValid(this.lastProductionShift) && isValid(this.lastHourlyShift))
      return this.lastHourlyShift!.toString();

    if (isValid(this.lastProductionShift) && !isValid(this.lastHourlyShift))
      return this.lastProductionShift!.toString();

    return max([this.lastProductionShift ?? "", this.lastHourlyShift ?? ""]).toString();
  }

  estimatedWeeklyEarnings({ weekStartsOn = "monday" }: { weekStartsOn?: keyof typeof DAYS } = {}) {
    if (!this.user.shifts) return 0;

    const production = this.user.shifts?.production.reduce((acc, shift) => {
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

    const hourly = this.user.shifts?.hourly?.reduce((acc, shift) => {
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
