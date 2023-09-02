import { PATH_NAMES, SUPPORTED_LOCALES } from "@/utils/constants";
import { HTMLAttributes } from "react";
import { z } from "zod";
import { SuscribeSchema } from ".";

export * from "@/types/zod";
export * from "@/types/services";

/* 
  Routes types
*/

export type RouteParams = {
  params: {
    id: string;
  };
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
