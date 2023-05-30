import { DashboardInterface, UserType } from "@/types/services";
import { Shift } from "@prisma/client";
import { isThisWeek, max, differenceInMinutes, minutesToHours } from "date-fns";

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
    return this.user.shifts.length;
  }

  get hoursWorked() {
    const total = this.user.shifts.reduce((acc, shift, i) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    return minutesToHours(total);
  }

  get averageHoursWorkedPerDay() {
    return this.hoursWorked / this.shiftsLen;
  }

  get hourValue() {
    return this.user.profile?.hourlyRate ?? 0;
  }

  get minuteValue() {
    return this.hourValue / 60;
  }

  get lastDayRegistered() {
    return max(
      this.user.shifts.map((shift) => new Date(shift.startDate))
    ).toString();
  }

  differenceBetweenStartAndEnd(shift: Shift): number {
    const start = new Date(shift.startDate);
    const end = new Date(shift?.endDate ?? "");
    const difference = differenceInMinutes(end, start);

    return difference;
  }

  transformUser(user: UserType): UserType {
    const amount: Shift[] = user.shifts.map((shift) => ({
      ...shift,
      amount: this.convertAmountInDecimal(shift),
    }));

    const userTransformed: UserType = {
      ...this.user,
      shifts: amount,
    };

    return userTransformed;
  }

  convertAmountInDecimal(shift: Shift): number {
    const value = this.differenceBetweenStartAndEnd(shift);
    return Math.round((value / 60) * 100) / 100;
  }

  getPaidInWeek() {
    return this.user.shifts.reduce((acc, shift) => {
      const amount = shift.amount ?? 0;

      if (isThisWeek(new Date(shift.startDate))) {
        return (acc + amount) * this.minuteValue;
      }

      return acc;
    }, 0);
  }

  dashboardData() {
    return {
      shiftsLen: this.shiftsLen,
      hoursWorked: this.hoursWorked,
      averageHoursWorkedPerDay: this.averageHoursWorkedPerDay,
      hourValue: this.hourValue,
      lastDayRegistered: this.lastDayRegistered,
      getPaidInWeek: this.getPaidInWeek(),
    };
  }
}

export default Dashboard;
