import { Profile, Shift } from "@prisma/client";

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

        firstName: profile.firstName,
        lastName: profile.lastName,
        address: profile.address,
        city: profile.city,
        country: profile.country,
      },
    });

    return profileCreated;
  }
}

export default ProfileService;
