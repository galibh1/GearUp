import { z } from "zod";

const rentalOrderIdSchema = z
  .string({
    error: "Rental order ID is required",
  })
  .uuid(
    "Rental order ID must be a valid UUID",
  );

const gearItemIdSchema = z
  .string({
    error: "Gear item ID is required",
  })
  .uuid(
    "Gear item ID must be a valid UUID",
  );

const reviewIdSchema = z
  .string({
    error: "Review ID is required",
  })
  .uuid(
    "Review ID must be a valid UUID",
  );

const ratingSchema = z
  .number({
    error: "Rating is required and must be a number",
  })
  .int(
    "Rating must be an integer",
  )
  .min(
    1,
    "Rating must be at least 1",
  )
  .max(
    5,
    "Rating cannot exceed 5",
  );

const commentSchema = z
  .string({
    error: "Review comment is required",
  })
  .trim()
  .min(
    10,
    "Review comment must contain at least 10 characters",
  )
  .max(
    1000,
    "Review comment cannot exceed 1000 characters",
  );

const createReviewValidationSchema = z.object({
  body: z
    .object({
      rentalOrderId:
        rentalOrderIdSchema,

      gearItemId:
        gearItemIdSchema,

      rating:
        ratingSchema,

      comment:
        commentSchema,
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const updateReviewValidationSchema = z.object({
  body: z
    .object({
      rating:
        ratingSchema.optional(),

      comment:
        commentSchema.optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.rating !== undefined ||
        data.comment !== undefined,
      {
        message:
          "At least one of rating or comment must be provided",
      },
    ),

  params: z
    .object({
      id: reviewIdSchema,
    })
    .strict(),

  query: z.object({}).strict(),
});

const reviewIdValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: reviewIdSchema,
    })
    .strict(),

  query: z.object({}).strict(),
});

const gearReviewQueryValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      gearItemId:
        gearItemIdSchema,
    })
    .strict(),

  query: z
    .object({
      page: z.coerce
        .number({
          error: "Page must be a number",
        })
        .int(
          "Page must be an integer",
        )
        .positive(
          "Page must be greater than zero",
        )
        .default(1),

      limit: z.coerce
        .number({
          error: "Limit must be a number",
        })
        .int(
          "Limit must be an integer",
        )
        .min(
          1,
          "Limit must be at least 1",
        )
        .max(
          100,
          "Limit cannot exceed 100",
        )
        .default(10),

      sortOrder: z
        .enum([
          "asc",
          "desc",
        ])
        .default("desc"),
    })
    .strict(),
});

export const reviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
  reviewIdValidationSchema,
  gearReviewQueryValidationSchema,
};