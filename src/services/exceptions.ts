import { HandlerErrorTypes } from "@/types/services";
import { EXCEPTIONS } from "@/utils/constants";

interface InterfaceExceptionsHandler {
  handler: HandlerErrorTypes;
  handleException(handler: HandlerErrorTypes): ExceptionsHandler;
}

/**
 * @class ExceptionsHandler
 * @description Class to handle exceptions
 * @param {HandlerErrorTypes} handler - Type of error to handle
 */
class ExceptionsHandler extends Error implements InterfaceExceptionsHandler {
  handler: HandlerErrorTypes;

  constructor(handler: HandlerErrorTypes) {
    const { message, cause } = EXCEPTIONS[handler];
    super(message);
    this.handler = handler;
    this.cause = cause;
  }

  handleException(handler: HandlerErrorTypes) {
    return new ExceptionsHandler(handler);
  }
}

export default ExceptionsHandler;
