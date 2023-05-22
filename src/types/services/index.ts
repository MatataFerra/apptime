import { HandleErrorTypesSchema } from "@/utils/constants";
import { z } from "zod";

export type HandleErrorTypes = z.infer<typeof HandleErrorTypesSchema>;
export interface InterfaceConfig {
  config: {
    message: string;
    cause?: string;
    type_error: HandleErrorTypes;
  };
}
