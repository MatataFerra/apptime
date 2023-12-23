import { Profile } from "@prisma/client";
import _ from "lodash";
import { describe, expect,test } from "vitest";

import PayService from "@/services/Pay";

import { userMocked } from "../../mocks";

describe("Test Pay Service", () => {
  test("Should calculate publicHolidayPay", function () {
    const user = _.cloneDeep(userMocked);
    const publicHolidayPay = PayService.publicHolidayPay({
      profile: user.profile as Profile,
      shift: user.shifts.at(-1)!,
    });

    /*
      inputs:
        hourlyRate: 10.5
        holidayPayRate: 1.5 (because is worked)
        amount of minutes worked: 125 + 8 = 133

        Minute rate: 10.5 / 60 = 0.175

        Total: 0.175 * 133 = 23.275 * 1.5 = 34.912499999999994
    */

    expect(publicHolidayPay).toBe(34.912499999999994);
  });

  test("Should calculate regularDayPay", function () {
    const user = _.cloneDeep(userMocked);
    const regularPay = PayService.regularDayPay({
      profile: user.profile as Profile,
      shift: user.shifts[0],
    });

    /*
      inputs:
        hourlyRate: 10.5
        amount of minutes worked: 125

        Minute rate: 10.5 / 60 = 0.175

        Total: 0.175 * 125 = 21.875
    */

    expect(regularPay).toBe(21.875);
  });

  test("Should calculate historical pay shift ", function () {
    const user = _.cloneDeep(userMocked);

    const historicalPay = PayService.historicalPay({ user });

    /*
      Inputs:
      8 shifts with regular pay
      1 shift with public holiday pay (the last one)
      each shift has 125 minutes of work plus index i.e.: 125 + 0, 125 + 1 ... 125 + 7
      for instance we have 125 + 126 + 127 + 128 +129 +130 + 131 + 132 + 133 
      -> 1028 minutes regular 133 public holiday

      Minute rate: 10.5 / 60 = 0.175
      holidayPayRate: 1.5 (because is worked)

      Regular shifts = 1028 * 0.175 = 179.9
      Public Holiday shit = 133 * 0.175 * 1.5 = 34.9128

      historical = 179.9 + 34.9125 = 214.8125

    */

    expect(historicalPay).toBe(214.8125);
  });
});
