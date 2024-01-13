import { Profile } from "@prisma/client";

class ProfileService {
  profile: Profile;

  constructor(profile: Profile) {
    this.profile = profile;
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
