import type { Config, Hourly, Production, Profile, Shift, Tax, User } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import { z } from "zod";

import type { BG_TAILWIND_COLOR, FROM_TO_TAILWIND_COLOR } from "@/types/tailwind";
import { HandleErrorTypeSchema } from "@/types/zod";

// Types
export interface UserType extends User {
  config: Config | null;
  shifts: Shifts | null;
  profile: Profile | null;
}

export type Shifts = Shift & {
  production: Production[];
  hourly: Hourly[];
};

export type Taxes = Tax & {
  hourly: Hourly[];
  production: Production[];
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
  user: UserType;
  get shiftsLen(): number;
  get hoursWorked(): number;
  get averageHoursWorkedPerDay(): number;
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
  | "short"
  | "long";

// Chart
export type EarnsMonthData = {
  month: string;
  earnings: number;
} | null;

//Color

export type Gradient = {
  from: FROM_TO_TAILWIND_COLOR["from"];
  to: FROM_TO_TAILWIND_COLOR["to"];
};

export type PlainColor = BG_TAILWIND_COLOR;

export type Color = PlainColor | Gradient;

export type ColorWithGradientAndHex<T> = T extends Gradient ? { from: string; to: string } : string;
