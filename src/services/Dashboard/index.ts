import { isThisWeek, max } from "date-fns";
import { isNaN as isLodashNan } from "lodash";

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
    const production = this.user.shifts.productions.length;
    const hourly = this.user.shifts.hourlies.length;
    return production + hourly;
  }

  get hoursWorked() {
    const production = this.user.shifts.productions.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    const hourly = this.user.shifts.hourlies.reduce((acc, shift) => {
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
    return max(this.user.shifts.productions.map((shift) => new Date(shift.startDate)));
  }

  get lastHourlyShift() {
    return max(this.user.shifts.hourlies.map((shift) => new Date(shift.startDate)));
  }

  get lastDayRegistered() {
    if (this.user.shifts.hourlies.length === 0) return "There is no data";
    return max([new Date(this.lastProductionShift), new Date(this.lastHourlyShift)]).toString();
  }

  estimatedWeeklyEarnings({ weekStartsOn = "monday" }: { weekStartsOn?: keyof typeof DAYS } = {}) {
    const production = this.user.shifts.productions.reduce((acc, shift) => {
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

    const hourly = this.user.shifts.hourlies.reduce((acc, shift) => {
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
