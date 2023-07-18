import { z } from "zod";

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

const UserUpdateSchema = UserModelSchema.partial().superRefine(
  (values, ctx) => {
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
  }
);

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
  "CustomError",
]);

export {
  ShiftModelSchema,
  ShiftUpdateSchema,
  ShiftCreateSchema,
  UserModelSchema,
  UserUpdateSchema,
  UserCreateSchema,
  ProfileSchema,
  ProfileUpdateSchema,
  ProfileCreateSchema,
  SearchParamsSchema,
  HandleErrorTypeSchema,
};
