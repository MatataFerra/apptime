import { z } from "zod";

import Password from "@/services/Auth/password";

const ShiftModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  amount: z.number().nullable(),
  endDate: z.string().nullable(),
  isClosed: z.boolean(),
  isPublicHoliday: z.boolean(),
  publicHolidayWorked: z.boolean(),
  notes: z.string().nullable(),
  startDate: z.string(),
  userId: z.string().nullable(),
});

const ProfileSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  endHour: z.number(),
  extraNightShiftPay: z.number(),
  holidayPay: z.boolean(),
  holidayPayRate: z.number(),
  hourlyRate: z.number(),
  nightShift: z.boolean(),
  startHour: z.number(),
  unpaidBreaks: z.number(),
  userId: z.string().nullable(),
});

const UserModelSchema = z.object({
  id: z.string({
    required_error: "Id must be provided correctly",
  }),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable().default("https://i.imgur.com/6VBx3io.png"),
  name: z.string(),
  password: z.string(),
  online: z.boolean().default(false),
  formCompleted: z.boolean().default(false),
  type_account: z.enum(["CREDENTIALS", "OAUTH"]).default("CREDENTIALS"),
  role: z.enum(["USER", "ADMIN", "SUPER_USER"]).default("USER"),
  isActive: z.boolean().default(true),
});

const UserUpdateSchema = UserModelSchema.partial().superRefine((values, ctx) => {
  if (Object.keys(values).length < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "One field must be provided",
    });
  }

  if (values.password || values.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Can't update those fields",
    });
  }
});

const UserCreateSchema = UserModelSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ProfileUpdateSchema = ProfileSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

const ProfileCreateSchema = ProfileSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ShiftCreateSchema = ShiftModelSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ShiftUpdateSchema = ShiftModelSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

const SearchParamsSchema = z.object({
  shifts: z.string().nullable(),
  profile: z.string().nullable(),
});

/* 
  Suscribe Schema
*/

const SuscribeSchema = z.object({
  email: z.string().email({ message: "Email is not valid" }),
});

/* 
  Validate Password
*/

const PasswordSchema = z.object({
  password: z.string().superRefine((data, ctx) => {
    const passValidate = new Password(data).validPassword();

    if (!passValidate.valid) {
      const messages = {
        CAPITAL_LETTER: passValidate.errors?.CAPITAL_LETTER?.message,
        MIN_LENGTH: passValidate.errors?.MIN_LENGTH?.message,
        ONE_NUMBER: passValidate.errors?.ONE_NUMBER?.message,
        SPECIAL_CHAR: passValidate.errors?.SPECIAL_CHAR?.message,
      };
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: JSON.stringify(messages, null, 2),
      });
    }
  }),
});

/**
 * @description Enum to handle errors
 */
const HandleErrorTypeSchema = z.enum([
  "UserNotFound",
  "UserAlreadyExists",
  "UserNotAllowed",
  "ShiftNotFound",
  "InternalServer",
  "PrismaClientFields",
  "PrismaClientUpdateRecord",
  "QueryNotProvided",
  "BodyNotProvided",
  "ProfileNotFound",
  "ProfileAlreadyExists",
  "PasswordIsNotValid",
  "DataProvidedIsNotValid",
  "PasswordSchema",
  "CustomError",
]);

export {
  HandleErrorTypeSchema,
  PasswordSchema,
  ProfileCreateSchema,
  ProfileSchema,
  ProfileUpdateSchema,
  SearchParamsSchema,
  ShiftCreateSchema,
  ShiftModelSchema,
  ShiftUpdateSchema,
  SuscribeSchema,
  UserCreateSchema,
  UserModelSchema,
  UserUpdateSchema,
};
