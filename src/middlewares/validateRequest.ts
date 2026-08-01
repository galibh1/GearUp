import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import AppError from "../errors/AppError";

const validateRequest = (
  schema: ZodType,
): RequestHandler => {
  return (req, _res, next): void => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      const errorDetails =
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

      next(
        new AppError(
          400,
          "Validation failed",
          errorDetails,
        ),
      );

      return;
    }

    req.validatedData = result.data;

    next();
  };
};

export default validateRequest;