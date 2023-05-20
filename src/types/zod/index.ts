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

const UserModelSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  endHour: z.number(),
  extraNightShiftPay: z.number(),
  formCompleted: z.boolean(),
  holidayPay: z.boolean(),
  holidayPayRate: z.number(),
  hourlyRate: z.number(),
  lastname: z.string(),
  name: z.string(),
  nightShift: z.boolean(),
  online: z.boolean(),
  password: z.string(),
  startHour: z.number(),
  unpaidBreaks: z.number(),
  shifts: z.array(ShiftModelSchema),
});

const UserUpdateSchema = UserModelSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

const UserCreateSchema = UserModelSchema.omit({
  id: true,
  shifts: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const Data = z.object({
  message: z.string(),
  response: z.boolean(),
  shift: z.union([z.array(ShiftModelSchema).optional(), ShiftModelSchema]),
  user: z.union([z.array(UserModelSchema).optional(), UserModelSchema]),
});

export {
  Data,
  ShiftModelSchema,
  UserModelSchema,
  UserUpdateSchema,
  UserCreateSchema,
};
