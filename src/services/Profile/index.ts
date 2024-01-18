import { Profile } from "@prisma/client";

import prisma from "@/../prisma/client";

class ProfileService {
  profile: Profile;

  constructor(profile: Profile) {
    this.profile = profile;
  }

  static async createProfile({
    userId,
    profile,
  }: {
    userId: string;
    profile: Omit<Profile, "id" | "userId">;
  }) {
    const profileCreated = await prisma.profile.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },

        endHour: profile.endHour,
        hourlyRate: profile.hourlyRate,
        startHour: profile.startHour,
        holidayPay: profile.holidayPay,
        nightShift: profile.nightShift,
        extraNightShiftPay: profile.extraNightShiftPay,
        holidayPayRate: profile.holidayPayRate,
        unpaidBreaks: profile.unpaidBreaks,
      },
    });

    return profileCreated;
  }

  static convertHourlyRateInMinuteRate(hourlyRate: Profile["hourlyRate"]) {
    return hourlyRate / 60;
  }

  static convertHourInFloat(hour: string) {
    const [hourPart, minutePart] = hour.split(":");
    return Number(hourPart) + Number(minutePart) / 60;
  }

  static convertFloatInHour(float: number) {
    const hour = Math.floor(float);
    const minute = Math.round((float - hour) * 60);

    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }
}

export default ProfileService;
