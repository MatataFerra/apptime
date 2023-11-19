import ProfileService from "@/services/Profile";

describe("Profile Service", () => {
  it("should convert hourly rate in minute rate", () => {
    expect(ProfileService.convertHourlyRateInMinuteRate(10)).toBe(0.16666666666666666);
  });

  it("should convert float in hour with a number who starts with cero", () => {
    expect(ProfileService.convertFloatInHour(9.5)).toBe("09:30");
  });

  it("should convert float in hour", () => {
    expect(ProfileService.convertFloatInHour(10.5)).toBe("10:30");
  });

  it("should convert hour in float", () => {
    expect(ProfileService.convertHourInFloat("10:30")).toBe(10.5);
  });
});
