export type HandlerErrorTypes = "UserNotFound" | "UserAlreadyExists";
export interface InterfaceConfig {
  config: {
    message: string;
    cause?: string;
    type_error: HandlerErrorTypes;
  };
}
