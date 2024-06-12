import type { HTMLInputTypeAttribute } from "react";

import type { Tax } from "@prisma/client";
import { z } from "zod";

import { type CSSClassNames, FastChargeFormSchema, ProductionJobFormSchema } from "@/types";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";

export enum FormStep {
  PERSONAL_INFO,
  PAY_INFO,
  SHIFT_INFO,
}

export type FormStepStore = {
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
};

// Inputs

export type Variants = keyof typeof INPUT_VARIANTS;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  classes?: CSSClassNames;
  containerClasses?: CSSClassNames;
  labelClasses?: CSSClassNames;
  variant?: Variants;
  type?: HTMLInputTypeAttribute;
  basis?: `basis-${string}`;
  spacing?: number;
  isError?: boolean;
  isRequired?: boolean;
  label?: string;
  description?: string;
  measure?: string;
  measurePlace?: "left" | "right";
}

export interface InputMeasureProps extends InputProps {
  inputClasses?: CSSClassNames;
}

// Fast Charge Form

export type FastChargeInputs = z.infer<typeof FastChargeFormSchema>;
export type FastChargeInputsParsed = {
  startDate: string;
  hourValue: number;
  endDate: string;
  isPublicHoliday: boolean;
  isWorked: boolean;
  holidayPay: boolean;
  holidayPayRate: number;
  unpaidBreaks: number;
  saveTaxes: boolean;
  taxes: Omit<Tax, "id">[] | [];
};

// Production Form
export type ProductionInputs = z.infer<typeof ProductionJobFormSchema>;
export type ProductionInputsParsed = {
  startDate: string;
  endDate: string;
  itemValue: number;
  itemQuantity: number;
  holidayPayRate: number;
  isPublicHoliday: boolean;
  publicHolidayWorked: boolean;
  taxes: Omit<Tax, "id">[] | [];
  saveTaxes: boolean;
};
