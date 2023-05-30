import { z } from "zod";
import { Data } from ".";

export * from "@/types/zod";

/* 
  Types for testing Api
*/
export type TypeData = z.infer<typeof Data>;

/* 
  Routes types
*/

export type RouteParams = {
  params: {
    id: string;
  };
};
