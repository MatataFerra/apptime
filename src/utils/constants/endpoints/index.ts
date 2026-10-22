export const ENV_URL = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_URL;

export const API_ENDPOINTS = {
  WAITING_LIST: `/api/waiting-list`,
  USER: `/api/user`,
  SHIFT: `/api/shift`,
  HOURLY: `/api/shift/hourly`,
  PRODUCTION: `/api/shift/production`,
  TAX: `/api/tax`,
  CONTRIBUTIONS: `/api/contributions`,
  SALARY_ITEMS: `/api/salary-items`,
} as const;
