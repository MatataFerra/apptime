import type { HTMLAttributes } from "react";

import { z } from "zod";

import { ShiftCreateSchema, ShiftModelSchema, SuscribeSchema } from "@/types";

import { SUPPORTED_LOCALES, TAX_CODES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

export * from "@/types/services";
export * from "@/types/zod";

/*
  Shift
*/

export type ShiftCreate = z.infer<typeof ShiftCreateSchema>;
export type ShiftSchema = z.infer<typeof ShiftModelSchema>;
export type TypeShift = "PRODUCTION" | "FAST" | "TRACK";

/* 
  Routes types
*/

export type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/*
  ClassNames Tailwind Types
*/

export type CSSClassNames = HTMLAttributes<HTMLElement>["className"];

/*
  Locale Types
*/

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Params<K extends string, T> = {
  [key in K]: T;
};

export type LocaleParams = Params<"locale", Locale>;

export type PathNames = (typeof PATH_NAMES)[keyof typeof PATH_NAMES];

export type PathNamesPaths = {
  [key in PathNames]: string;
};

export type Inputs = z.infer<typeof SuscribeSchema>;

export type LoginInputs = {
  email: string;
  password: string;
};

export type TaxCodes = (typeof TAX_CODES)[keyof typeof TAX_CODES];

/**
 * A tax or contribution as the user enters it. Owner (userId) and
 * `archived` are set on the server.
 */
export type SalaryItemInput = { name: string; value: number; description: string | null };

/** A saved tax or contribution, with how many shifts use it. */
export type SavedSalaryItem = {
  id: number;
  name: string;
  value: number;
  description: string | null;
  archived: boolean;
  userId: string | null;
  uses: number;
};

export type SalaryItems = { contributions: SavedSalaryItem[]; taxes: SavedSalaryItem[] };

/** A saved employer as the API sends it (dates as ISO strings). */
export type SavedEmployer = {
  id: number;
  name: string;
  taxId: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
  country: string | null;
  industry: string | null;
  /** Kind of work for a visa extension (VISA_WORK_TYPES). */
  visaWorkType: string | null;
  /** Postcode where the work is done, when it isn't the address one. */
  workPostcode: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  defaultRate: number | null;
  defaultCurrency: string | null;
  notes: string | null;
  /** Register the details came from and when ("Data sourced from the …"). */
  sourceRegistry: string | null;
  sourcedAt: string | null;
  /** Removed by the user but still named on old shifts. */
  archived: boolean;
  /** Shifts logged for it (hourly + production). */
  shifts: number;
  createdAt: string;
  updatedAt: string;
};
