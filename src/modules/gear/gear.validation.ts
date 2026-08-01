import { z } from "zod";

const gearNameValidation = z
  .string({
    error: "Gear name is required",
  })
  .trim()
  .min(
    2,
    "Gear name must contain at least 2 characters",
  )
  .max(
    255,
    "Gear name cannot exceed 255 characters",
  );

const gearSlugValidation = z
  .string({
    error: "Gear slug is required",
  })
  .trim()
  .toLowerCase()
  .min(
    2,
    "Gear slug must contain at least 2 characters",
  )
  .max(
    280,
    "Gear slug cannot exceed 280 characters",
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Gear slug must contain lowercase letters, numbers, and hyphens only",
  );

const gearDescriptionValidation = z
  .string({
    error: "Gear description is required",
  })
  .trim()
  .min(
    10,
    "Gear description must contain at least 10 characters",
  )
  .max(
    5000,
    "Gear description cannot exceed 5000 characters",
  );

const gearBrandValidation = z
  .string()
  .trim()
  .min(
    1,
    "Brand cannot be empty",
  )
  .max(
    100,
    "Brand cannot exceed 100 characters",
  );

const pricePerDayValidation = z
  .number({
    error: "Price per day is required and must be a number",
  })
  .positive(
    "Price per day must be greater than zero",
  )
  .max(
    1_000_000,
    "Price per day is too large",
  );

const depositAmountValidation = z
  .number({
    error: "Deposit amount must be a number",
  })
  .nonnegative(
    "Deposit amount cannot be negative",
  )
  .max(
    10_000_000,
    "Deposit amount is too large",
  );

const stockValidation = z
  .number({
    error: "Stock is required and must be a number",
  })
  .int(
    "Stock must be an integer",
  )
  .nonnegative(
    "Stock cannot be negative",
  )
  .max(
    100_000,
    "Stock value is too large",
  );

const availableStockValidation = z
  .number({
    error: "Available stock must be a number",
  })
  .int(
    "Available stock must be an integer",
  )
  .nonnegative(
    "Available stock cannot be negative",
  )
  .max(
    100_000,
    "Available stock value is too large",
  );

const categoryIdValidation = z
  .string({
    error: "Category ID is required",
  })
  .uuid(
    "Category ID must be a valid UUID",
  );

const gearIdValidation = z
  .string({
    error: "Gear ID is required",
  })
  .uuid(
    "Gear ID must be a valid UUID",
  );

const imageUrlsValidation = z
  .array(
    z
      .string()
      .trim()
      .url(
        "Each gear image must be a valid URL",
      ),
  )
  .max(
    10,
    "A gear item cannot have more than 10 images",
  );

const specificationsValidation = z.record(
  z.string(),
  z.unknown(),
);

const gearConditionValidation = z.enum(
  [
    "NEW",
    "LIKE_NEW",
    "GOOD",
    "FAIR",
  ],
  {
    error:
      "Condition must be NEW, LIKE_NEW, GOOD, or FAIR",
  },
);

const gearStatusValidation = z.enum(
  [
    "AVAILABLE",
    "UNAVAILABLE",
    "ARCHIVED",
  ],
  {
    error:
      "Status must be AVAILABLE, UNAVAILABLE, or ARCHIVED",
  },
);

const locationValidation = z
  .string()
  .trim()
  .min(
    2,
    "Location must contain at least 2 characters",
  )
  .max(
    255,
    "Location cannot exceed 255 characters",
  );

const createGearValidationSchema = z.object({
  body: z
    .object({
      name: gearNameValidation,

      slug: gearSlugValidation,

      description:
        gearDescriptionValidation,

      brand:
        gearBrandValidation.optional(),

      pricePerDay:
        pricePerDayValidation,

      depositAmount:
        depositAmountValidation.optional(),

      stock:
        stockValidation,

      availableStock:
        availableStockValidation.optional(),

      condition:
        gearConditionValidation.optional(),

      status:
        gearStatusValidation.optional(),

      imageUrls:
        imageUrlsValidation.optional(),

      specifications:
        specificationsValidation.optional(),

      location:
        locationValidation.optional(),

      isFeatured:
        z.boolean().optional(),

      categoryId:
        categoryIdValidation,
    })
    .strict()
    .refine(
      (payload) =>
        payload.availableStock === undefined ||
        payload.availableStock <= payload.stock,
      {
        message:
          "Available stock cannot exceed total stock",
        path: ["availableStock"],
      },
    ),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const updateGearValidationSchema = z.object({
  body: z
    .object({
      name:
        gearNameValidation.optional(),

      slug:
        gearSlugValidation.optional(),

      description:
        gearDescriptionValidation.optional(),

      brand:
        gearBrandValidation
          .nullable()
          .optional(),

      pricePerDay:
        pricePerDayValidation.optional(),

      depositAmount:
        depositAmountValidation.optional(),

      stock:
        stockValidation.optional(),

      availableStock:
        availableStockValidation.optional(),

      condition:
        gearConditionValidation.optional(),

      status:
        gearStatusValidation.optional(),

      imageUrls:
        imageUrlsValidation.optional(),

      specifications:
        specificationsValidation
          .nullable()
          .optional(),

      location:
        locationValidation
          .nullable()
          .optional(),

      isFeatured:
        z.boolean().optional(),

      categoryId:
        categoryIdValidation.optional(),
    })
    .strict()
    .refine(
      (payload) =>
        Object.keys(payload).length > 0,
      {
        message:
          "At least one gear field must be provided",
      },
    )
    .refine(
      (payload) =>
        payload.stock === undefined ||
        payload.availableStock === undefined ||
        payload.availableStock <= payload.stock,
      {
        message:
          "Available stock cannot exceed total stock",
        path: ["availableStock"],
      },
    ),

  params: z
    .object({
      id: gearIdValidation,
    })
    .strict(),

  query: z.object({}).strict(),
});

const gearIdValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: gearIdValidation,
    })
    .strict(),

  query: z.object({}).strict(),
});

const queryBooleanValidation = z
  .enum(
    ["true", "false"],
    {
      error:
        "Boolean query value must be true or false",
    },
  )
  .transform(
    (value) => value === "true",
  );

const gearQueryValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z.object({}).strict(),

  query: z
    .object({
      search: z
        .string()
        .trim()
        .min(
          1,
          "Search value cannot be empty",
        )
        .max(
          100,
          "Search value cannot exceed 100 characters",
        )
        .optional(),

      categoryId:
        categoryIdValidation.optional(),

      category: z
        .string()
        .trim()
        .min(
          1,
          "Category value cannot be empty",
        )
        .max(
          120,
          "Category value cannot exceed 120 characters",
        )
        .optional(),

      brand: z
        .string()
        .trim()
        .min(
          1,
          "Brand value cannot be empty",
        )
        .max(
          100,
          "Brand value cannot exceed 100 characters",
        )
        .optional(),

      condition:
        gearConditionValidation.optional(),

      status:
        gearStatusValidation.optional(),

      minPrice: z.coerce
        .number({
          error:
            "Minimum price must be a number",
        })
        .nonnegative(
          "Minimum price cannot be negative",
        )
        .optional(),

      maxPrice: z.coerce
        .number({
          error:
            "Maximum price must be a number",
        })
        .nonnegative(
          "Maximum price cannot be negative",
        )
        .optional(),

      available:
        queryBooleanValidation.optional(),

      isFeatured:
        queryBooleanValidation.optional(),

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

      sortBy: z
        .enum([
          "createdAt",
          "updatedAt",
          "name",
          "pricePerDay",
        ])
        .default("createdAt"),

      sortOrder: z
        .enum([
          "asc",
          "desc",
        ])
        .default("desc"),
    })
    .strict()
    .refine(
      (query) =>
        query.minPrice === undefined ||
        query.maxPrice === undefined ||
        query.maxPrice >= query.minPrice,
      {
        message:
          "Maximum price must be greater than or equal to minimum price",
        path: ["maxPrice"],
      },
    ),
});

export const gearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
  gearIdValidationSchema,
  gearQueryValidationSchema,
};