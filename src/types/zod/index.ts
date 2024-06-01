import { z } from "zod";

import Password from "@/services/Auth/password";

/*
  Index Schemas:

  - Shift
  - Profile
  - User
  - Tax
  - SearchParams
  - Suscribe
  - Validate password
  - Fast Charge Form
  - Production Form Job
  - Enum to handle errors
*/

/*
===================================================================
-------------------------Shift-------------------------------------
===================================================================
*/

const BaseShiftSchema = z.object({
  startDate: z.string(),
  endDate: z.string().nullable(),
  amount: z.number().nullable(),
  isClosed: z.boolean(),
  isPublicHoliday: z.boolean(),
  publicHolidayWorked: z.boolean(),
  notes: z.string().nullable(),
  holidayPay: z.boolean(),
  holidayPayRate: z.number().nullable(),
  unpaidBreaks: z.number().nullable(),
  shiftId: z.number().nullable(),
});

const ProductionShiftSchema = BaseShiftSchema.merge(
  z.object({
    id: z.number({
      required_error: "Id must be provided correctly",
    }),
    itemValue: z.number().nullable(),
    itemQuantity: z.number().nullable(),
  })
);

const HourlyShiftSchema = BaseShiftSchema.merge(
  z.object({
    id: z.number({
      required_error: "Id must be provided correctly",
    }),
    hourValue: z.number().nullable(),
  })
);

const ShiftModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  hourly: z.array(HourlyShiftSchema).nullable(),
  production: z.array(ProductionShiftSchema).nullable(),
  userId: z.string().nullable(),
});

const ProductionCreateSchema = ProductionShiftSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const HourlyCreateSchema = HourlyShiftSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ShiftCreateSchema = ShiftModelSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ShiftUpdateSchema = ShiftModelSchema.omit({
  id: true,
});

const ProductionUpdateSchema = ProductionShiftSchema.omit({
  id: true,
});

const HourlyUpdateSchema = HourlyShiftSchema.omit({
  id: true,
});

/*
===================================================================
-------------------------Profile-----------------------------------
===================================================================
*/

const ProfileSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  firstName: z.string(),
  lastName: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  userId: z.string().nullable(),
});

const ProfileCreateSchema = ProfileSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const ProfileUpdateSchema = ProfileSchema.partial().refine(
  (values) => Object.keys(values).length > 0,
  { message: "One of the fields must be defined" }
);

/*
===================================================================
-------------------------User--------------------------------------
===================================================================
*/

const UserModelSchema = z.object({
  id: z.string({
    required_error: "Id must be provided correctly",
  }),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable().default("/assets/avatar.svg"),
  name: z.string().default("User"),
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

/*
===================================================================
-------------------------Tax---------------------------------------
===================================================================
*/

const TaxSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  description: z.string().nullable(),
  internalId: z.string(),
  hourlyId: z.number().nullable(),
  productionId: z.number().nullable(),
});

const TaxCreateSchema = TaxSchema.omit({
  id: true,
  internalId: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const TaxUpdateSchema = TaxSchema.omit({
  id: true,
  internalId: true,
});

/*
============================================================================
============================================================================
*/

/* 
  SearchParams Schema
*/

const SearchParamsSchema = z.object({
  shifts: z.string().nullable(),
  profile: z.string().nullable(),
  config: z.string().nullable(),
  email: z.string().nullable(),
  only: z.string().nullable(),
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

/* 
  Fast Charge Schema
*/

const FastChargeFormSchema = z.object({
  "start-date": z.string().refine((value) => !!value, {
    message: "Start date must be provided",
  }),

  "finish-date": z.string().refine((value) => !!value, {
    message: "Finish date must be provided",
  }),
  "start-time": z.string().refine((value) => !!value, {
    message: "Start time must be provided",
  }),
  "finish-time": z.string().refine((value) => !!value, {
    message: "Finish time must be provided",
  }),
  "fast-holiday": z.boolean(),
  "fast-worked": z.boolean(),
  "hour-value": z.string().refine((value) => !!value, {
    message: "Hour value must be greater than 0",
  }),
  "unpaid-breaks": z.string().nullable(),
  "holiday-pay-rate": z.string().nullable(),
});

const FastChargeFormCheckDataSchema = z.object({
  startDate: z.string().min(1),
  finishDate: z.string().min(1),
  hourValue: z.string().min(1),
});

/* 
  Production Form Job Schema
*/

const ProductionJobFormSchema = z.object({
  "start-date": z.string(),
  "finish-date": z.string(),
  "item-value": z.string().refine((value) => !!value, {
    message: "Hour value must be greater than 0",
  }),
  "item-quantity": z.string().refine((value) => !!value, {
    message: "Hour value must be greater than 0",
  }),
  "holiday-pay-rate": z.string().refine((value) => !!value, {
    message: "Holiday pay rate must be greater than 0",
  }),
  "is-public-holiday": z.boolean(),
  "is-worked": z.boolean(),
});

const ProductionJobFormCheckDataSchema = z.object({
  startDate: z.string().min(1),
  finishDate: z.string().min(1),
  itemValue: z.string().min(1),
  itemQuantity: z.string().min(1),
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
  "SettingsNotUpdated",
]);

export {
  BaseShiftSchema,
  FastChargeFormCheckDataSchema,
  FastChargeFormSchema,
  HandleErrorTypeSchema,
  HourlyCreateSchema,
  HourlyShiftSchema,
  HourlyUpdateSchema,
  PasswordSchema,
  ProductionCreateSchema,
  ProductionJobFormCheckDataSchema,
  ProductionJobFormSchema,
  ProductionShiftSchema,
  ProductionUpdateSchema,
  ProfileCreateSchema,
  ProfileSchema,
  ProfileUpdateSchema,
  SearchParamsSchema,
  ShiftCreateSchema,
  ShiftModelSchema,
  ShiftUpdateSchema,
  SuscribeSchema,
  TaxCreateSchema,
  TaxSchema,
  TaxUpdateSchema,
  UserCreateSchema,
  UserModelSchema,
  UserUpdateSchema,
};
