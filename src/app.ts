import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { z } from "zod";

import config from "./config";
import AppError from "./errors/AppError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import validateRequest from "./middlewares/validateRequest";
import { authRoutes } from "./modules/auth/auth.route";

const app = express();

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
 * Global middlewares
 */
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

/**
 * Root endpoint
 */
app.get(
  "/",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: "Welcome to GearUp API",
      data: {
        name: "GearUp",
        description:
          "Rent sports and outdoor gear instantly",
        version: "1.0.0",
      },
    });
  },
);

/**
 * Health-check endpoint
 */
app.get(
  "/api/health",
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: "GearUp API is healthy",
      data: {
        status: "healthy",
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

/**
 * Authentication routes
 *
 * POST /api/auth/register
 * POST /api/auth/login
 */
app.use("/api/auth", authRoutes);

/**
 * Temporary validation test route
 */
app.post(
  "/api/test-validation",
  validateRequest(testValidationSchema),
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: "Request validation passed",
      data: req.validatedData,
    });
  },
);

/**
 * Temporary global error test route
 */
app.get(
  "/api/test-error",
  (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    next(
      new AppError(
        400,
        "This is a test error",
        {
          field: "test",
          issue:
            "Error handling is working correctly",
        },
      ),
    );
  },
);

/**
 * 404 route handler
 */
app.use(notFound);

/**
 * Global error handler
 * This must remain the final middleware.
 */
app.use(globalErrorHandler);

export default app;