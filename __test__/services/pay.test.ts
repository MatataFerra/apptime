import { describe, expect, it } from "vitest";

import Pay from "@/services/Pay";

import { userTestData } from "#/mocks";

describe("Pay Class with UserType Data", () => {
  it("should correctly calculate earnings for a user with production shifts", () => {
    /* 
      1. Se toma el earn del shift $50 itemValue, itemQuantity: 40 -> 50 * 40 --> $2000
      2. se restan los taxes
        a) 10% -> $200
        b) 15% -> $270
        TOTAL: $1530
      3. Se agregan contribuciones //!DESESTIMADO
        a) 5% -> 76.5
        b) 7% -> 112.445
        TOTAL: $1718.955
    */

    const productionShift = userTestData.shifts?.production[0];

    const pay = new Pay(productionShift!);
    const gross = pay.gross();

    const netPay = pay.netPay();
    expect(netPay).toBeCloseTo(1530, 3);
    expect(gross).toBeCloseTo(2000, 2);
  });

  it("should correctly calculate earnings for a user with hourly shifts", () => {
    /*
      1. Se toma el earn del shift 480 min * $30 x hora - 30 min no pagos --> TOTAL: $225
      2. se restan los taxes
        a) 8% -> 18
        b) 12% -> 24.84
        TOTAL: $182.16
      3. Se agregan contribuciones //!DESESTIMADO
        a) 4% -> 7.2
        TOTAL: $189.36
    */
    const hourlyShift = userTestData.shifts?.hourly[0];

    const pay = new Pay(hourlyShift!);
    const gross = pay.gross();

    const netPay = pay.netPay();

    expect(netPay).toBeCloseTo(182.16, 2);
    expect(gross).toBeCloseTo(225, 2);
  });
});
