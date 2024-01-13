export const ENV_URL = process.env.VERCEL_URL ?? process.env.NEXTAUTH_URL;

export const API_ENDPOINTS = {
  WAITING_LIST: `/api/waiting-list`,
  REGISTER: `/api/user/create`,
  USER: `/api/user`,
  PROFILE: `/api/profile`,
  SHIFT: `/api/shift`,
};
