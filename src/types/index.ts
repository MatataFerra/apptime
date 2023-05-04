import { z } from "zod";
import { Data } from ".";

export * from "@/types/zod";

export type TypeData = z.infer<typeof Data>;
