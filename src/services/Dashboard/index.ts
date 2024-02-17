import { isThisWeek, max } from "date-fns";
import { isNaN as isLodashNan } from "lodash";

import ShiftService from "@/services/Shift";

import { type DashboardInterface, type DashboardUserType, DAYS } from "@/types/services";

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
  user: DashboardUserType;
  constructor(user: DashboardUserType) {
    this.user = user;
  }

  get shiftsLen() {
    return this.user.shifts.length;
  }

  get hoursWorked() {
    const total = this.user.shifts.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    return total;
  }

  get averageHoursWorkedPerDay() {
    const total = this.hoursWorked / this.shiftsLen;

    if (isLodashNan(total)) return 0;

    return total;
  }

  get hourValue() {
    return this.user.profile?.hourlyRate ?? 0;
  }

  get minuteValue() {
    return this.hourValue / 60;
  }

  get lastDayRegistered() {
    if (this.user.shifts.length === 0) return "There is no data";
    return max(this.user.shifts.map((shift) => new Date(shift.startDate))).toString();
  }

  // We can refactor this function using the Pay Service, also we can migrate this
  // functionality to Pay Service and create a better abastraction
  estimatedWeeklyEarnings({ weekStartsOn }: { weekStartsOn: keyof typeof DAYS }) {
    return this.user.shifts.reduce((acc, shift) => {
      const amount = shift.amount ?? 0;

      if (
        (isThisWeek(new Date(shift.startDate)),
        {
          weekStartsOn: DAYS[weekStartsOn as keyof typeof DAYS],
        })
      ) {
        const total = amount * this.minuteValue;
        const newValue = acc + total;

        return newValue;
      }

      return acc;
    }, 0);
  }

  dashboardData() {
    return {
      shiftsLen: this.shiftsLen,
      hoursWorked: ShiftService.convertAmountInDecimal(this.hoursWorked),
      averageHoursWorkedPerDay: ShiftService.convertAmountInDecimal(this.averageHoursWorkedPerDay),
      hourValue: this.hourValue,
      lastDayRegistered: this.lastDayRegistered,
      estimatedWeeklyEarnings: this.estimatedWeeklyEarnings({ weekStartsOn: "monday" }),
    };
  }
}

export default Dashboard;
