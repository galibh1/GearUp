class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorDetails: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorDetails: unknown = null,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;