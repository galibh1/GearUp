import { z } from "zod";

const rentalIdValidation = z
  .string({
    error: "Rental order ID is required",
  })
  .uuid("Rental order ID must be a valid UUID");

const gearItemIdValidation = z
  .string({
    error: "Gear item ID is required",
  })
  .uuid("Gear item ID must be a valid UUID");

const rentalItemValidationSchema = z
  .object({
    gearItemId: gearItemIdValidation,

    quantity: z
      .number({
        error: "Quantity is required and must be a number",
      })
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than zero")
      .max(
        100,
        "A single rental item quantity cannot exceed 100",
      ),
  })
  .strict();

const createRentalValidationSchema = z.object({
  body: z
    .object({
      startDate: z
        .string({
          error: "Start date is required",
        })
        .datetime({
          offset: true,
          message:
            "Start date must be a valid ISO date and time",
        }),

      endDate: z
        .string({
          error: "End date is required",
        })
        .datetime({
          offset: true,
          message:
            "End date must be a valid ISO date and time",
        }),

      notes: z
        .string()
        .trim()
        .max(
          1000,
          "Rental notes cannot exceed 1000 characters",
        )
        .optional(),

      items: z
        .array(rentalItemValidationSchema, {
          error: "Rental items are required",
        })
        .min(
          1,
          "At least one gear item must be selected",
        )
        .max(
          20,
          "A rental order cannot contain more than 20 gear items",
        ),
    })
    .strict()
    .superRefine((payload, context) => {
      const startDate = new Date(payload.startDate);
      const endDate = new Date(payload.endDate);

      if (startDate.getTime() < Date.now()) {
        context.addIssue({
          code: "custom",
          path: ["startDate"],
          message:
            "Rental start date cannot be in the past",
        });
      }

      if (
        endDate.getTime() <=
        startDate.getTime()
      ) {
        context.addIssue({
          code: "custom",
          path: ["endDate"],
          message:
            "Rental end date must be after the start date",
        });
      }

      const gearItemIds = payload.items.map(
        (item) => item.gearItemId,
      );

      const uniqueGearItemIds = new Set(
        gearItemIds,
      );

      if (
        uniqueGearItemIds.size !==
        gearItemIds.length
      ) {
        context.addIssue({
          code: "custom",
          path: ["items"],
          message:
            "The same gear item cannot be added more than once",
        });
      }
    }),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const rentalIdValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: rentalIdValidation,
    })
    .strict(),

  query: z.object({}).strict(),
});

const cancelRentalValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: rentalIdValidation,
    })
    .strict(),

  query: z.object({}).strict(),
});

const updateRentalStatusValidationSchema =
  z.object({
    body: z
      .object({
        status: z.enum(
          [
            "CONFIRMED",
            "PICKED_UP",
            "RETURNED",
          ],
          {
            error:
              "Status must be CONFIRMED, PICKED_UP, or RETURNED",
          },
        ),
      })
      .strict(),

    params: z
      .object({
        id: rentalIdValidation,
      })
      .strict(),

    query: z.object({}).strict(),
  });

const rentalQueryValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z.object({}).strict(),

  query: z
    .object({
      status: z
        .enum([
          "PLACED",
          "CONFIRMED",
          "PAID",
          "PICKED_UP",
          "RETURNED",
          "CANCELLED",
        ])
        .optional(),

      page: z.coerce
        .number({
          error: "Page must be a number",
        })
        .int("Page must be an integer")
        .positive(
          "Page must be greater than zero",
        )
        .default(1),

      limit: z.coerce
        .number({
          error: "Limit must be a number",
        })
        .int("Limit must be an integer")
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
        .enum(["asc", "desc"])
        .default("desc"),
    })
    .strict(),
});

export const rentalValidation = {
  createRentalValidationSchema,
  rentalIdValidationSchema,
  cancelRentalValidationSchema,
  updateRentalStatusValidationSchema,
  rentalQueryValidationSchema,
};