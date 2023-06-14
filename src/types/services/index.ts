import { Profile, Shift, User } from "@prisma/client";
import { z } from "zod";
import { HandleErrorTypeSchema } from "../zod";

// Types
export type UserType = User & { shifts: Shift[]; profile: Profile | null };
export type HandleErrorType = z.infer<typeof HandleErrorTypeSchema>;

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
  get hourValue(): number;
  get lastDayRegistered(): string;
  getPaidInWeek(): number;
  dashboardData(): {
    shiftsLen: number;
    hoursWorked: number;
    averageHoursWorkedPerDay: number;
    hourValue: number;
    lastDayRegistered: string;
    getPaidInWeek: number;
  };
}
