import { HandleErrorTypes } from "@/types/services";
import { EXCEPTIONS, HandleErrorTypesSchema } from "@/utils/constants";

interface InterfaceExceptionsHandler {
  handler: HandleErrorTypes;
  handleException(handler: HandleErrorTypes): ExceptionsHandler;
}

/**
 * @class ExceptionsHandler
 * @description Class to handle exceptions
 * @param {HandlerErrorTypes} handler - Type of error to handle
 */
class ExceptionsHandler extends Error implements InterfaceExceptionsHandler {
  handler: HandleErrorTypes;

  constructor(handler: HandleErrorTypes) {
    const { message, cause } = EXCEPTIONS[handler];
    super(message);
    this.handler = handler;
    this.cause = cause;
  }

  handleException() {
    this.parse();
    return new ExceptionsHandler(this.handler);
  }

  parse() {
    const parseHandler = HandleErrorTypesSchema.safeParse(this.handler);
    if (!parseHandler.success) {
      throw new Error("Handler not found");
    }
  }
}

function ExceptionsHandlerFactory(handler: HandleErrorTypes) {
  return new ExceptionsHandler(handler);
}

export default ExceptionsHandlerFactory;
