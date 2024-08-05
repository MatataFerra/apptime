export const ENV_URL = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_URL;

export const API_ENDPOINTS = {
  WAITING_LIST: `/api/waiting-list`,
  REGISTER: `/api/user/create`,
  USER: `/api/user`,
  PROFILE: `/api/profile`,
  SHIFT: `/api/shift`,
  TAX: `/api/tax`,
} as const;
