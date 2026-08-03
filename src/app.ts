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
import { categoryRoutes } from "./modules/category/category.route";
import { adminRoutes } from "./modules/admin/admin.route";

import {
  providerGearRouter,
  publicGearRouter,
} from "./modules/gear/gear.route";
import {
  paymentRoutes,
  paymentWebhookRouter,
} from "./modules/payment/payment.route";
import {
  providerOrderRoutes,
  rentalRoutes,
} from "./modules/rental/rental.route";
import { reviewRoutes } from "./modules/review/review.route";

const app = express();

const testValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email(
        "A valid email address is required",
      ),

    quantity: z
      .number()
      .int(
        "Quantity must be an integer",
      )
      .positive(
        "Quantity must be greater than zero",
      ),
  }),

  params: z.object({}),
  query: z.object({}),
});

/**
 * CORS middleware
 */
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);


app.use(
  "/api/payments/webhook",
  paymentWebhookRouter,
);


app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());


app.get(
  "/",
  (
    _req: Request,
    res: Response,
  ): void => {
    res.status(200).json({
      success: true,
      message:
        "Welcome to GearUp API",

      data: {
        name: "GearUp",

        description:
          "Rent sports and outdoor gear instantly",

        version: "1.0.0",
      },
    });
  },
);


app.get(
  "/api/health",
  (
    _req: Request,
    res: Response,
  ): void => {
    res.status(200).json({
      success: true,
      message:
        "GearUp API is healthy",

      data: {
        status: "healthy",
        environment:
          config.NODE_ENV,

        timestamp:
          new Date().toISOString(),
      },
    });
  },
);


app.use(
  "/api/auth",
  authRoutes,
);

/**
 * Admin endpoints
 *
 * GET   /api/admin/users
 * GET   /api/admin/users/:id
 * PATCH /api/admin/users/:id
 */
app.use(
  "/api/admin",
  adminRoutes,
);

/**
 * Category endpoints
 *
 * GET    /api/categories
 * GET    /api/categories/:id
 * POST   /api/categories
 * PATCH  /api/categories/:id
 * DELETE /api/categories/:id
 */
app.use(
  "/api/categories",
  categoryRoutes,
);

/**
 * Public gear endpoints
 *
 * GET /api/gear
 * GET /api/gear/:id
 */
app.use(
  "/api/gear",
  publicGearRouter,
);

/**
 * Provider gear-management endpoints
 *
 * GET    /api/provider/gear
 * POST   /api/provider/gear
 * PUT    /api/provider/gear/:id
 * DELETE /api/provider/gear/:id
 */
app.use(
  "/api/provider/gear",
  providerGearRouter,
);

/**
 * Customer rental endpoints
 *
 * POST  /api/rentals
 * GET   /api/rentals
 * GET   /api/rentals/:id
 * PATCH /api/rentals/:id/cancel
 */
app.use(
  "/api/rentals",
  rentalRoutes,
);

/**
 * Provider rental-order endpoints
 *
 * GET   /api/provider/orders
 * PATCH /api/provider/orders/:id
 */
app.use(
  "/api/provider/orders",
  providerOrderRoutes,
);

/**
 * Customer payment endpoints
 *
 * POST /api/payments/create
 * POST /api/payments/confirm
 * GET  /api/payments
 * GET  /api/payments/:id
 */
app.use(
  "/api/payments",
  paymentRoutes,
);

/**
 * Review endpoints
 *
 * POST   /api/reviews
 * GET    /api/reviews/gear/:gearItemId
 * GET    /api/reviews/:id
 * PATCH  /api/reviews/:id
 * DELETE /api/reviews/:id
 */
app.use(
  "/api/reviews",
  reviewRoutes,
);

/**
 * Temporary validation test route
 */
app.post(
  "/api/test-validation",
  validateRequest(
    testValidationSchema,
  ),
  (
    req: Request,
    res: Response,
  ): void => {
    res.status(200).json({
      success: true,
      message:
        "Request validation passed",
      data: req.validatedData,
    });
  },
);

/**
 * Temporary global-error test route
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
 * Invalid route handler
 */
app.use(notFound);

/**
 * Global error handler
 *
 * This must remain the final middleware.
 */
app.use(globalErrorHandler);

export default app;