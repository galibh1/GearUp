import { z } from "zod";

const rentalOrderIdValidation = z
  .string({
    error: "Rental order ID is required",
  })
  .uuid(
    "Rental order ID must be a valid UUID",
  );

const paymentIdValidation = z
  .string({
    error: "Payment ID is required",
  })
  .uuid(
    "Payment ID must be a valid UUID",
  );

const stripeSessionIdValidation = z
  .string({
    error: "Stripe Session ID is required",
  })
  .trim()
  .min(
    1,
    "Stripe Session ID is required",
  )
  .max(
    255,
    "Stripe Session ID cannot exceed 255 characters",
  )
  .startsWith(
    "cs_",
    "A valid Stripe Checkout Session ID is required",
  );

const createPaymentValidationSchema = z.object({
  body: z
    .object({
      rentalOrderId:
        rentalOrderIdValidation,
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const confirmPaymentValidationSchema = z.object({
  body: z
    .object({
      stripeSessionId:
        stripeSessionIdValidation,
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const paymentIdValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: paymentIdValidation,
    })
    .strict(),

  query: z.object({}).strict(),
});

const paymentQueryValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z.object({}).strict(),

  query: z
    .object({
      status: z
        .enum([
          "PENDING",
          "COMPLETED",
          "FAILED",
          "REFUNDED",
        ])
        .optional(),

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

export const paymentValidation = {
  createPaymentValidationSchema,
  confirmPaymentValidationSchema,
  paymentIdValidationSchema,
  paymentQueryValidationSchema,
};