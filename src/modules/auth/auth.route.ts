import { Router } from "express";

import validateRequest from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(
    authValidation.registerUserValidationSchema,
  ),
  authController.registerUser,
);

router.post(
  "/login",
  validateRequest(
    authValidation.loginUserValidationSchema,
  ),
  authController.loginUser,
);

export const authRoutes = router;