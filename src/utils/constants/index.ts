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
export const DEFAULT_LOCALE = SUPPORTED_LOCALES[0];

export const PASSWORD = {
  PASSWORD_CODE_ERRORS: {
    CAPITAL_LETTER: 1,
    ONE_NUMBER: 2,
    MIN_LENGTH: 3,
    SPECIAL_CHAR: 4,
  },

  PASSWORD_MESSAGE_ERROR: {
    CAPITAL_LETTER: "Password must have at least one capital letter",
    ONE_NUMBER: "Password must have at least one number",
    MIN_LENGTH: "Password must have at least minimun length",
    SPECIAL_CHAR: "Password must have at least one special character",
  },

  PASSWORD_REQUIREMENTS: {
    CAPITAL_LETTER: "At least 1 uppercase letter",
    ONE_NUMBER: "At least 1 number",
    MIN_LENGTH: "At least 8 characters",
    SPECIAL_CHAR: "At least 1 special character",
  },
};

export const MAX_ATTEMPTS_TO_REGISTER = 3;
export const MAX_TIME_FOR_RETRY_REGISTER_IN_MS = 60000;
