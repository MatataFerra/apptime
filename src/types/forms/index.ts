import type { HTMLInputTypeAttribute } from "react";

import { z } from "zod";

import {
  type CSSClassNames,
  FastChargeFormSchema,
  HourlyShiftSchema,
  ProductionJobFormSchema,
} from "@/types";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";

import type { ContributionElement, TaxElement } from "@/store/useTaxOrContributionStore";

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
  showPassword?: boolean;
  onShowPasswordChange?: () => void;
}

export interface InputMeasureProps extends InputProps {
  inputClasses?: CSSClassNames;
}

// Fast Charge Form

export type FastChargeInputs = z.infer<typeof FastChargeFormSchema>;
export type FastChargeInputsParsed = {
  startDate: string;
  endDate: string;
  hourValue: number;
  name: string | null;
  isPublicHoliday: boolean;
  isWorked: boolean;
  unpaidBreaks: number;
  taxes: TaxElement[] | [];
  contributions: ContributionElement[] | [];
};

// Production Form
export type ProductionInputs = z.infer<typeof ProductionJobFormSchema>;
export type ProductionInputsParsed = {
  startDate: string;
  endDate: string;
  name: string | null;
  itemValue: number;
  itemQuantity: number;
  isPublicHoliday: boolean;
  publicHolidayWorked: boolean;
  taxes: TaxElement[] | [];
  contributions: ContributionElement[] | [];
};

// Track Form
export type TrackInputs = z.infer<typeof HourlyShiftSchema>;
