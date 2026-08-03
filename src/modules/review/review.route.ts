import { Router } from "express";

import { auth } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const reviewRoutes = Router();

/**
 * Customer creates a review after a rental is returned.
 *
 * POST /api/reviews
 */
reviewRoutes.post(
  "/",
  auth("CUSTOMER"),
  validateRequest(
    reviewValidation.createReviewValidationSchema,
  ),
  reviewController.createReview,
);

/**
 * Publicly retrieve reviews for a gear item.
 *
 * GET /api/reviews/gear/:gearItemId
 */
reviewRoutes.get(
  "/gear/:gearItemId",
  validateRequest(
    reviewValidation.gearReviewQueryValidationSchema,
  ),
  reviewController.getGearReviews,
);

/**
 * Publicly retrieve one review.
 *
 * GET /api/reviews/:id
 */
reviewRoutes.get(
  "/:id",
  validateRequest(
    reviewValidation.reviewIdValidationSchema,
  ),
  reviewController.getReviewById,
);

/**
 * Customer updates their own review.
 *
 * PATCH /api/reviews/:id
 */
reviewRoutes.patch(
  "/:id",
  auth("CUSTOMER"),
  validateRequest(
    reviewValidation.updateReviewValidationSchema,
  ),
  reviewController.updateReview,
);

/**
 * Customer deletes their own review.
 *
 * DELETE /api/reviews/:id
 */
reviewRoutes.delete(
  "/:id",
  auth("CUSTOMER"),
  validateRequest(
    reviewValidation.reviewIdValidationSchema,
  ),
  reviewController.deleteReview,
);

export { reviewRoutes };