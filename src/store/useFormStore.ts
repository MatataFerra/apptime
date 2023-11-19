import { Profile } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import ProfileService from "@/services/Profile";

type User = { name: string; surname: string };

interface FormStore {
  user: User;
  profile: Omit<Profile, "id" | "userId">;
  setUser: (user: Partial<User>) => void;
  setProfile: (profile: Partial<Omit<Profile, "id" | "userId">>) => void;
  detectInputType: (value: string) => number;
}

export const useFormStore = create(
  devtools<FormStore>(
    (set) => {
      return {
        user: {
          name: "",
          surname: "",
        },
        profile: {
          startHour: 0,
          endHour: 0,
          extraNightShiftPay: 0,
          holidayPay: false,
          holidayPayRate: 0,
          hourlyRate: 0,
          nightShift: false,
          unpaidBreaks: 0,
        },

        setUser: (user: Partial<User>) => {
          set(
            (state) => ({
              user: {
                ...state.user,
                ...user,
              },
            }),
            false,
            "SET_USER"
          );
        },
        setProfile: (profile: Partial<FormStore["profile"]>) =>
          set(
            (state) => ({
              profile: {
                ...state.profile,
                ...profile,
              },
            }),
            false,
            "SET_PROFILE"
          ),

        detectInputType: (value: string) => {
          if (value.includes(":")) {
            return ProfileService.convertHourInFloat(value);
          }

          return Number(value);
        },
      };
    },
    {
      name: "formStore",
    }
  )
);
