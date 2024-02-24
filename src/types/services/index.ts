import { Profile, Shift, User } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { z } from "zod";

import { HandleErrorTypeSchema } from "../zod";

// Types
export type UserType = User & {
  shifts: Shift[];
  profile: Profile | null;
};
export type HandleErrorType = z.infer<typeof HandleErrorTypeSchema>;

export type DashboardUserType = UserType;

// Interfaces
export interface InterfaceConfig {
  config: {
    message: string;
    cause?: string;
    type_error: HandleErrorType;
  };
}

export interface DashboardInterface {
  user: DashboardUserType;
  get shiftsLen(): number;
  get hoursWorked(): number;
  get averageHoursWorkedPerDay(): number;
  get hourValue(): number;
  get lastDayRegistered(): string;
  estimatedWeeklyEarnings({ weekStartsOn }: { weekStartsOn?: keyof typeof DAYS }): number;
  dashboardData(): {
    shiftsLen: number;
    hoursWorked: number;
    averageHoursWorkedPerDay: number;
    hourValue: number;
    lastDayRegistered: string;
    estimatedWeeklyEarnings: number;
  };
}

// Days
export const DAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
} as const;

export interface JWTDecodedType extends JWT {
  accessToken: string;
  email: string;
  name: string;
  image: string;
  role: "USER" | "ADMIN" | "SUPER_USER";
}

// Password
export type PassedErrors = {
  CAPITAL_LETTER: boolean;
  MIN_LENGTH: boolean;
  ONE_NUMBER: boolean;
  SPECIAL_CHAR: boolean;
};

// Date Humanizer
export type DateHumanizerStrategy =
  | "today"
  | "distanceToNow"
  | "formatAndAddTime"
  | "formatDate"
  | "short";
