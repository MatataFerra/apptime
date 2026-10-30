import { z } from "zod";

import Password from "@/services/Auth/password";

/*
  Index Schemas:

  - Shift
  - Profile
  - User
  - Tax
  - Shift with Tax
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
  name: z.string().nullable(),
  amount: z.number().nullable(),
  isClosed: z.boolean(),
  isPublicHoliday: z.boolean(),
  publicHolidayWorked: z.boolean(),
  notes: z.string().nullable(),
  unpaidBreaks: z.number().nullable(),
  shiftId: z.number().nullable(),
  /** ISO 4217; null means the user's default currency. */
  currency: z.string().length(3).nullable().optional(),
  /** Who the shift was for; null means none. Ownership is checked on the server. */
  employerId: z.number().int().positive().nullable().optional(),
});

const ProductionShiftSchema = BaseShiftSchema.merge(
  z.object({
    id: z.number({
      error: "Id must be provided correctly",
    }),
    itemValue: z.number().nullable(),
    itemQuantity: z.number().nullable(),
  })
);

const HourlyShiftSchema = BaseShiftSchema.merge(
  z.object({
    id: z.number({
      error: "Id must be provided correctly",
    }),
    hourValue: z.number().nullable(),
    /** "track" | "fast" */
    source: z.string().nullable().optional(),
  })
);

const ShiftModelSchema = z.object({
  id: z.number({
    error: "Id must be provided correctly",
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
    error: "Id must be provided correctly",
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
    error: "Id must be provided correctly",
  }),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().default("/assets/avatar.svg"),
  name: z.string().default("User"),
  online: z.boolean().default(false),
  formCompleted: z.boolean().default(false),
  type_account: z.enum(["CREDENTIALS", "OAUTH"]).default("CREDENTIALS"),
  role: z.enum(["USER", "ADMIN", "SUPER_USER"]).default("USER"),
  isActive: z.boolean().default(true),
});

/**
 * The fields a user update may carry, all optional and without defaults:
 * a field left out stays as it is. (`UserModelSchema.partial()` would not do:
 * since Zod 4, defaults are filled in for missing optional keys too.)
 */
const UserUpdateFieldsSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  image: z.string().nullable().optional(),
  name: z.string().optional(),
  online: z.boolean().optional(),
  formCompleted: z.boolean().optional(),
  type_account: z.enum(["CREDENTIALS", "OAUTH"]).optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_USER"]).optional(),
  isActive: z.boolean().optional(),
});

const UserUpdateSchema = UserUpdateFieldsSchema.superRefine((values, ctx) => {
  if (Object.keys(values).length < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "One field must be provided",
    });
  }

  if (values.role === "ADMIN") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Can't create the user",
    });
  }

  if (values.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Can't update those fields",
    });
  }
});

const UserCreateSchema = UserModelSchema.omit({
  id: true,
}).superRefine((values, ctx) => {
  if (Object.keys(values).length < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "One field must be provided",
    });
  }

  if (values.role === "ADMIN") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Can't create admin user",
    });
  }
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
});

const TaxCreateSchema = TaxSchema.omit({
  id: true,
}).refine((values) => Object.keys(values).length > 0, {
  message: "One of the fields must be defined",
});

const TaxUpdateSchema = TaxSchema.omit({
  id: true,
});

/*
===================================================================
-------------------------Shift with Tax---------------------------
===================================================================
*/

const BaseShiftWithTaxes = BaseShiftSchema.merge(
  z.object({
    taxes: TaxSchema.array().nullable(),
  })
);

const HourlyShiftWithTaxes = HourlyShiftSchema.merge(
  z.object({
    taxes: TaxSchema.array().nullable(),
  })
);

const ProductionShiftWithTaxes = ProductionShiftSchema.merge(
  z.object({
    taxes: TaxSchema.array().nullable(),
  })
);

/*
============================================================================
============================================================================
*/

/* 
  SearchParams Schema
*/

// shifts/profile/config are flags, not JSON: they used to be JSON.parse'd
// straight into a Prisma include, so any object (e.g. a nested include of
// accounts and sessions) reached the query.
const IncludeFlag = z.enum(["true", "false"]).nullable();

const SearchParamsSchema = z.object({
  shifts: IncludeFlag,
  profile: IncludeFlag,
  config: IncludeFlag,
  email: z.string().nullable(),
  only: z.string().nullable(),
});

/* 
  Suscribe Schema
*/

const SuscribeSchema = z.object({
  // Message from the active language (hooks/useZodI18n).
  email: z.string().email(),
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

// Required-field messages come from the active language (hooks/useZodI18n).
const FastChargeFormSchema = z.object({
  "start-date": z.string().min(1),

  "finish-date": z.string().min(1),
  "start-time": z.string().min(1),
  "finish-time": z.string().min(1),
  name: z.string().nullable(),
  "is-public-holiday": z.boolean(),
  "is-public-holiday-worked": z.boolean(),
  "hour-value": z.string().min(1),
  "unpaid-breaks": z.string().nullable(),
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
  name: z.string().nullable(),
  "item-value": z.string().min(1),
  "item-quantity": z.string().min(1),
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
  BaseShiftWithTaxes,
  FastChargeFormCheckDataSchema,
  FastChargeFormSchema,
  HandleErrorTypeSchema,
  HourlyCreateSchema,
  HourlyShiftSchema,
  HourlyShiftWithTaxes,
  HourlyUpdateSchema,
  PasswordSchema,
  ProductionCreateSchema,
  ProductionJobFormCheckDataSchema,
  ProductionJobFormSchema,
  ProductionShiftSchema,
  ProductionShiftWithTaxes,
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
