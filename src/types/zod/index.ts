import { z } from "zod";

const ShiftModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  amount: z.number().nullable(),
  endDate: z.string().nullable(),
  isClosed: z.boolean(),
  isHoliday: z.boolean(),
  notes: z.string().nullable(),
  startDate: z.string(),
  userId: z.number().nullable(),
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
  userId: z.number().optional(),
});

const UserModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  email: z.string().email(),
  emailVerified: z.string().nullable(),
  image: z.string().nullable().default("https://i.imgur.com/6VBx3io.png"),
  name: z.string(),
  password: z.string(),
  online: z.boolean(),
  formCompleted: z.boolean(),
});

const UserUpdateSchema = UserModelSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
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
};
