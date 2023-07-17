import { Profile, Shift } from "@prisma/client";
import ProfileService from "../Profile";

type PayServiceType = {
  publicHolidayParams: {
    profile: Profile;
    shift: Omit<Shift, "id">;
  };
};

class PayService {
  static publicHolidayPay(params: PayServiceType["publicHolidayParams"]) {
    const { profile, shift } = params;
    const amount = shift.amount ?? 0;
    let rate: number = 1;
    const hourlyRate = ProfileService.convertHourlyRateInMinuteRate(
      profile.hourlyRate
    );

    if (shift.holidayWorked) rate = profile.holidayPayRate ?? 1;

    const holidayPay = amount * hourlyRate * rate;

    return holidayPay;
  }
}

export default PayService;
