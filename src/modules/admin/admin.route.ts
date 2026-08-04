import { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const adminRoutes = Router();


/**
 * Get all customers and providers.
 *
 * GET /api/admin/users
 */
adminRoutes.get(
  "/users",
  auth("ADMIN"),
  validateRequest(
    adminValidation.adminUsersQueryValidationSchema,
  ),
  adminController.getAllUsers,
);


/**
 * Get one customer or provider by ID.
 *
 * GET /api/admin/users/:id
 */
adminRoutes.get(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(
    adminValidation.adminUserIdValidationSchema,
  ),
  adminController.getUserById,
);


/**
 * Suspend, activate, or deactivate a user.
 *
 * PATCH /api/admin/users/:id
 */
adminRoutes.patch(
  "/users/:id",
  auth("ADMIN"),
  validateRequest(
    adminValidation.updateUserStatusValidationSchema,
  ),
  adminController.updateUserStatus,
);


/**
 * Get all gear items.
 *
 * GET /api/admin/gear
 */
adminRoutes.get(
  "/gear",
  auth("ADMIN"),
  validateRequest(
    adminValidation.adminGearQueryValidationSchema,
  ),
  adminController.getAllGear,
);


/**
 * Get all rental orders.
 *
 * GET /api/admin/rentals
 */
adminRoutes.get(
  "/rentals",
  auth("ADMIN"),
  validateRequest(
    adminValidation.adminRentalQueryValidationSchema,
  ),
  adminController.getAllRentals,
);


export { adminRoutes };