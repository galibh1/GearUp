import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import AppError from "../errors/AppError.js";

type ErrorResponse = {
  success: false;
  message: string;
  errorDetails: unknown;
};

const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;

  const response: ErrorResponse = {
    success: false,
    message: "Internal server error",
    errorDetails: null,
  };

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    response.message = error.message;
    response.errorDetails = error.errorDetails;
  } else if (error instanceof SyntaxError && "body" in error) {
    statusCode = 400;
    response.message = "Invalid JSON request body";
    response.errorDetails = null;
  } else if (error instanceof Error) {
    response.message = error.message || "Internal server error";

    if (process.env.NODE_ENV === "development") {
      response.errorDetails = {
        name: error.name,
        stack: error.stack,
      };
    }
  }

  res.status(statusCode).json(response);
};

export default globalErrorHandler;