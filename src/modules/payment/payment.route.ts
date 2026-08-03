import express, { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

/**
 * Stripe webhook router
 *
 * This router must be mounted before:
 * app.use(express.json())
 *
 * Mounted at:
 * /api/payments/webhook
 */
const paymentWebhookRouter = Router();

paymentWebhookRouter.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  paymentController.handleStripeWebhook,
);

/**
 * Customer payment routes
 *
 * Mounted at:
 * /api/payments
 */
const paymentRoutes = Router();

paymentRoutes.post(
  "/create",
  auth("CUSTOMER"),
  validateRequest(
    paymentValidation.createPaymentValidationSchema,
  ),
  paymentController.createPaymentSession,
);

paymentRoutes.post(
  "/confirm",
  auth("CUSTOMER"),
  validateRequest(
    paymentValidation.confirmPaymentValidationSchema,
  ),
  paymentController.confirmPayment,
);

paymentRoutes.get(
  "/",
  auth("CUSTOMER"),
  validateRequest(
    paymentValidation.paymentQueryValidationSchema,
  ),
  paymentController.getMyPayments,
);

paymentRoutes.get(
  "/:id",
  auth("CUSTOMER"),
  validateRequest(
    paymentValidation.paymentIdValidationSchema,
  ),
  paymentController.getPaymentById,
);

export {
  paymentRoutes,
  paymentWebhookRouter,
};