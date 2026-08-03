import { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { categoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";

const router = Router();

/**
 * Public category endpoints
 */
router.get(
  "/",
  categoryController.getAllCategories,
);

router.get(
  "/:id",
  validateRequest(
    categoryValidation.categoryIdValidationSchema,
  ),
  categoryController.getCategoryById,
);

/**
 * Admin-only category endpoints
 */
router.post(
  "/",
  auth("ADMIN"),
  validateRequest(
    categoryValidation.createCategoryValidationSchema,
  ),
  categoryController.createCategory,
);

router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    categoryValidation.updateCategoryValidationSchema,
  ),
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  auth("ADMIN"),
  validateRequest(
    categoryValidation.categoryIdValidationSchema,
  ),
  categoryController.deleteCategory,
);

export const categoryRoutes = router;