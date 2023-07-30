import { HTMLAttributes } from "react";

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
