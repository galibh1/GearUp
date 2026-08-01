import { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { rentalController } from "./rental.controller";
import { rentalValidation } from "./rental.validation";

/**
 * Customer rental routes
 *
 * Mounted at:
 * /api/rentals
 */
const rentalRoutes = Router();

rentalRoutes.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(
    rentalValidation.createRentalValidationSchema,
  ),
  rentalController.createRental,
);

rentalRoutes.get(
  "/",
  auth("CUSTOMER"),
  validateRequest(
    rentalValidation.rentalQueryValidationSchema,
  ),
  rentalController.getMyRentals,
);

rentalRoutes.get(
  "/:id",
  auth(
    "CUSTOMER",
    "PROVIDER",
    "ADMIN",
  ),
  validateRequest(
    rentalValidation.rentalIdValidationSchema,
  ),
  rentalController.getRentalById,
);

rentalRoutes.patch(
  "/:id/cancel",
  auth("CUSTOMER"),
  validateRequest(
    rentalValidation.cancelRentalValidationSchema,
  ),
  rentalController.cancelRental,
);

/**
 * Provider rental-order routes
 *
 * Mounted at:
 * /api/provider/orders
 */
const providerOrderRoutes = Router();

providerOrderRoutes.get(
  "/",
  auth("PROVIDER"),
  validateRequest(
    rentalValidation.rentalQueryValidationSchema,
  ),
  rentalController.getProviderOrders,
);

providerOrderRoutes.patch(
  "/:id",
  auth("PROVIDER"),
  validateRequest(
    rentalValidation.updateRentalStatusValidationSchema,
  ),
  rentalController.updateRentalStatus,
);

export {
  providerOrderRoutes,
  rentalRoutes,
};