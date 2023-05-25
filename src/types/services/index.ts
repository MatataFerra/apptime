import { HandleErrorTypeSchema } from "@/utils/constants";
import { z } from "zod";

export type HandleErrorType = z.infer<typeof HandleErrorTypeSchema>;
export interface InterfaceConfig {
  config: {
    message: string;
    cause?: string;
    type_error: HandleErrorType;
  };
}
