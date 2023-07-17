import { Profile } from "@prisma/client";

class ProfileService {
  profile: Profile;

  constructor(profile: Profile) {
    this.profile = profile;
  }

  static convertHourlyRateInMinuteRate(hourlyRate: Profile["hourlyRate"]) {
    return hourlyRate / 60;
  }
}

export default ProfileService;
