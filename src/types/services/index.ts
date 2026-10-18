import type {
  Config,
  Contribution,
  Hourly,
  Production,
  Profile,
  Shift,
  Tax,
  User,
} from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import { z } from "zod";

import { HandleErrorTypeSchema } from "@/types/zod";

// Types
export interface UserType extends User {
  config: Config | null;
  shifts: Shifts | null;
  profile: Profile | null;
}

export type ShiftType = ProductionType | HourlyType;

export type ProductionType = Production & {
  taxes?: Tax[] | null;
  contributions?: Contribution[] | null;
};

export type HourlyType = Hourly & {
  taxes?: Tax[] | null;
  contributions?: Contribution[] | null;
};

export type Shifts = Shift & {
  production: ProductionType[];
  hourly: HourlyType[];
};

export type Taxes = Tax & {
  hourly: Hourly[];
  production: Production[];
};

export type Contributions = Contribution & {
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

