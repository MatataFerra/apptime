import { EXCEPTIONS } from "../../utils/constants";
import _ from "lodash";

interface ExceptionsInterface {
  exception: {
    message: string;
    cause?: string;
    type_error: string;
  };
  stack?: string | undefined;
  handleError(): void;
}

export class ErrorBoundary extends Error implements ExceptionsInterface {
  constructor(exception: ExceptionsInterface["exception"]) {
    super(exception.message);
    this.exception = exception;
  }
  exception: {
    message: string;
    cause?: string | undefined;
    type_error: string;
  };

  handleError() {
    return this.exception;
  }
}

class ErrorFactory {
  public createError(exception: keyof typeof EXCEPTIONS): ExceptionsInterface {
    const typeError = EXCEPTIONS[exception];

    const errorDetails = _.cloneDeep(typeError);
    const typeErrorArray = Object.keys(EXCEPTIONS);

    if (typeErrorArray.includes(exception)) {
      return new ErrorBoundary(errorDetails);
    } else {
      throw new Error(`Error type '${exception}' not supported`);
    }
  }

  private sendLogs() {
    // Send logs to Sentry or other service
  }
}

const errorFactory = new ErrorFactory();

export default errorFactory;
