import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";

import { UserType } from "@/types";

type PayServiceType = {
  publicHolidayParams: {
    shift: Omit<Shift, "id">;
  };

  historicalShifts: {
    user: UserType;
  };
};

class PayService {
  static publicHolidayPay(params: PayServiceType["publicHolidayParams"]) {
    const { shift } = params;
    const amount = shift.amount ?? 0;
    let rate: number = 1;
    const hourlyRate = ShiftService.convertHourlyRateInMinuteRate(shift.hourValue);

    if (shift.publicHolidayWorked) rate = 1.5;

    const holidayPay = amount * hourlyRate * rate;

    return holidayPay;
  }

  static regularDayPay(params: PayServiceType["publicHolidayParams"]) {
    const { shift } = params;

    if (!shift.isClosed) return 0;

    const amount = shift.amount ?? 0;
    const hourlyRate = ShiftService.convertHourlyRateInMinuteRate(shift.hourValue);

    const regularPay = amount * hourlyRate;

    return regularPay;
  }

  static historicalPay(params: PayServiceType["historicalShifts"]) {
    const { user } = params;
    const shifts = user.shifts;

    if (!user.profile) {
      throw new Error("User does not have a profile");
    }

    const allShiftsPay = shifts.reduce((acc, curr) => {
      if (!curr.isClosed) return 0;

      if (curr.isPublicHoliday) {
        const publicHolidayPay = PayService.publicHolidayPay({
          shift: curr,
        });

        return acc + publicHolidayPay;
      }

      const regularPay = PayService.regularDayPay({
        shift: curr,
      });

      return acc + regularPay;
    }, 0);

    return allShiftsPay;
  }
}

export default PayService;
