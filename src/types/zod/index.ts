import { z } from "zod";

const ShiftModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  amount: z.number(),
  endDate: z.string(),
  isClosed: z.boolean(),
  isHoliday: z.boolean(),
  notes: z.string(),
  startDate: z.string(),
  userId: z.number().optional(),
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
  lastname: z.string(),
  name: z.string(),
  password: z.string(),
  online: z.boolean(),
  formCompleted: z.boolean(),
  profile: ProfileSchema.optional(),
  shifts: z.array(ShiftModelSchema),
});

const UserUpdateSchema = UserModelSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

const UserCreateSchema = UserModelSchema.omit({
  id: true,
  shifts: true,
  profile: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ShiftUpdateSchema = ShiftModelSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

const ShiftCreateSchema = ShiftModelSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const Data = z.object({
  message: z.string(),
  response: z.boolean(),
  shift: z.union([z.array(ShiftModelSchema).optional(), ShiftModelSchema]),
  user: z.union([z.array(UserModelSchema).optional(), UserModelSchema]),
});

const SearchParamsSchema = z.object({
  shifts: z.string().nullable(),
  profile: z.string().nullable(),
});

export {
  Data,
  ShiftModelSchema,
  ShiftUpdateSchema,
  ShiftCreateSchema,
  UserModelSchema,
  UserUpdateSchema,
  UserCreateSchema,
  SearchParamsSchema,
};
