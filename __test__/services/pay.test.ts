import { describe, expect, it } from "vitest";

import Pay from "@/services/Pay";

import { userTestData } from "#/mocks";

describe("Pay Class with UserType Data", () => {
  it("should correctly calculate earnings for a user with production shifts", () => {
    /* 
      1. Se toma el earn del shift $50 itemValue, itemQuantity: 40 -> 50 * 40 --> $2000
      2. Se suman las contribuciones sobre el base (5% + 7% = 12%) --> $2240
      3. Se restan los taxes, uno tras otro
        a) 10% -> $224
        b) 15% -> $302.4
        TOTAL: $1713.6
    */

    const productionShift = userTestData.shifts?.production[0];

    const pay = new Pay(productionShift!);
    const gross = pay.gross();

    const netPay = pay.netPay();
    expect(netPay).toBeCloseTo(1713.6, 3);
    expect(gross).toBeCloseTo(2240, 2);
  });

  it("should correctly calculate earnings for a user with hourly shifts", () => {
    /*
      1. Se toma el earn del shift 480 min * $30 x hora - 30 min no pagos --> TOTAL: $225
      2. Se suma la contribución sobre el base (4%) --> $234
      3. Se restan los taxes, uno tras otro
        a) 8% -> 18.72
        b) 12% -> 25.8336
        TOTAL: $189.4464
    */
    const hourlyShift = userTestData.shifts?.hourly[0];

    const pay = new Pay(hourlyShift!);
    const gross = pay.gross();

    const netPay = pay.netPay();

    expect(netPay).toBeCloseTo(189.45, 2);
    expect(gross).toBeCloseTo(234, 2);
  });
});
