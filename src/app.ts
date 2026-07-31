import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { z } from "zod";

import config from "./config/index.js";
import AppError from "./errors/AppError.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import notFound from "./middlewares/notFound.js";
import validateRequest from "./middlewares/validateRequest.js";

const app = express();

/**
 * Temporary schema for testing the validation middleware.
 * This route can be removed after the real modules are created.
 */
const testValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("A valid email address is required"),

    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than zero"),
  }),

  params: z.object({}),

  query: z.object({}),
});

/**
 * Global middleware
 */
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * Root route
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to GearUp API",
    data: {
      name: "GearUp",
      description: "Rent sports and outdoor gear instantly",
      version: "1.0.0",
    },
  });
});

/**
 * Health-check route
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is healthy",
    data: {
      status: "healthy",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Temporary route for testing request validation
 */
app.post(
  "/api/test-validation",
  validateRequest(testValidationSchema),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Request validation passed",
      data: req.validatedData,
    });
  },
);

/**
 * Temporary route for testing centralized error handling
 */
app.get(
  "/api/test-error",
  (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    next(
      new AppError(
        400,
        "This is a test error",
        {
          field: "test",
          issue: "Error handling is working correctly",
        },
      ),
    );
  },
);

/**
 * Invalid API route handler
 */
app.use(notFound);

/**
 * Global error handler
 * This must always be the final middleware.
 */
app.use(globalErrorHandler);

export default app;