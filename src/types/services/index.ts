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

export type DashboardUserType = Omit<UserType, "account" | "session">;

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
  estimatedWeeklyEarnings(): number;
  dashboardData(): {
    shiftsLen: number;
    hoursWorked: number;
    averageHoursWorkedPerDay: number;
    hourValue: number;
    lastDayRegistered: string;
    estimatedWeeklyEarnings: number;
  };
}

export interface JWTDecodedType extends JWT {
  accessToken: string;
  email: string;
  name: string;
  image: string;
  role: "USER" | "ADMIN" | "SUPER_USER";
}
