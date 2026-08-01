import { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { gearController } from "./gear.controller";
import { gearValidation } from "./gear.validation";

/**
 * Public gear routes
 *
 * Mounted at:
 * /api/gear
 */
const publicGearRouter = Router();

publicGearRouter.get(
  "/",
  validateRequest(
    gearValidation.gearQueryValidationSchema,
  ),
  gearController.getAllGear,
);

publicGearRouter.get(
  "/:id",
  validateRequest(
    gearValidation.gearIdValidationSchema,
  ),
  gearController.getSingleGear,
);

/**
 * Provider gear-management routes
 *
 * Mounted at:
 * /api/provider/gear
 */
const providerGearRouter = Router();

providerGearRouter.get(
  "/",
  auth("PROVIDER"),
  gearController.getMyGear,
);

providerGearRouter.post(
  "/",
  auth("PROVIDER"),
  validateRequest(
    gearValidation.createGearValidationSchema,
  ),
  gearController.createGear,
);

providerGearRouter.put(
  "/:id",
  auth("PROVIDER"),
  validateRequest(
    gearValidation.updateGearValidationSchema,
  ),
  gearController.updateGear,
);

providerGearRouter.delete(
  "/:id",
  auth("PROVIDER"),
  validateRequest(
    gearValidation.gearIdValidationSchema,
  ),
  gearController.deleteGear,
);

export {
  providerGearRouter,
  publicGearRouter,
};