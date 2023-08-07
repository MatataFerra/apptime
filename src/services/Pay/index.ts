import { Profile, Shift } from "@prisma/client";
import ProfileService from "../Profile";
import { UserType } from "@/types";

type PayServiceType = {
  publicHolidayParams: {
    profile: Profile;
    shift: Omit<Shift, "id">;
  };

  historicalShifts: {
    user: UserType;
  };
};

class PayService {
  static publicHolidayPay(params: PayServiceType["publicHolidayParams"]) {
    const { profile, shift } = params;
    const amount = shift.amount ?? 0;
    let rate: number = 1;
    const hourlyRate = ProfileService.convertHourlyRateInMinuteRate(profile.hourlyRate);

    if (shift.publicHolidayWorked) rate = profile.holidayPayRate ?? 1;

    const holidayPay = amount * hourlyRate * rate;

    return holidayPay;
  }

  static regularDayPay(params: PayServiceType["publicHolidayParams"]) {
    const { profile, shift } = params;

    if (!shift.isClosed) return 0;

    const amount = shift.amount ?? 0;
    const hourlyRate = ProfileService.convertHourlyRateInMinuteRate(profile.hourlyRate);

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
          profile: user.profile as Profile,
          shift: curr,
        });

        return acc + publicHolidayPay;
      }

      const regularPay = PayService.regularDayPay({
        profile: user.profile as Profile,
        shift: curr,
      });

      return acc + regularPay;
    }, 0);

    return allShiftsPay;
  }
}

export default PayService;
