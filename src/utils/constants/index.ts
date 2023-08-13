export * from "@/utils/constants/pathnames";
export * from "@/utils/constants/tailwind";

/* 
  @summary Contants for Routes
  @description This constants are used to handle routes
*/

export const QUERY_PARAMS = {
  USER_ID: "userId",
  PROFILE: "profile",
  SHIFTS: "shifts",
};

export const now = Date.now();

export const SALT = 10;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  SUPER_USER: "SUPER_USER",
};

export const SUPPORTED_LOCALES = ["en", "es"] as const;
