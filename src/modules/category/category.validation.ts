import { z } from "zod";

const categoryNameValidation = z
  .string({
    error: "Category name is required",
  })
  .trim()
  .min(
    2,
    "Category name must contain at least 2 characters",
  )
  .max(
    100,
    "Category name cannot exceed 100 characters",
  );

const categorySlugValidation = z
  .string({
    error: "Category slug is required",
  })
  .trim()
  .min(
    2,
    "Category slug must contain at least 2 characters",
  )
  .max(
    120,
    "Category slug cannot exceed 120 characters",
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Category slug must contain lowercase letters, numbers, and hyphens only",
  );

const categoryDescriptionValidation = z
  .string()
  .trim()
  .max(
    1000,
    "Category description cannot exceed 1000 characters",
  );

const categoryImageUrlValidation = z
  .string()
  .trim()
  .url("Category image must be a valid URL");

const createCategoryValidationSchema = z.object({
  body: z
    .object({
      name: categoryNameValidation,

      slug: categorySlugValidation,

      description:
        categoryDescriptionValidation.optional(),

      imageUrl:
        categoryImageUrlValidation.optional(),

      isActive: z.boolean().optional(),
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const updateCategoryValidationSchema = z.object({
  body: z
    .object({
      name:
        categoryNameValidation.optional(),

      slug:
        categorySlugValidation.optional(),

      description:
        categoryDescriptionValidation.optional(),

      imageUrl:
        categoryImageUrlValidation.optional(),

      isActive: z.boolean().optional(),
    })
    .strict()
    .refine(
      (payload) =>
        Object.keys(payload).length > 0,
      {
        message:
          "At least one category field must be provided",
      },
    ),

  params: z
    .object({
      id: z
        .string({
          error: "Category ID is required",
        })
        .uuid(
          "Category ID must be a valid UUID",
        ),
    })
    .strict(),

  query: z.object({}).strict(),
});

const categoryIdValidationSchema = z.object({
  body: z.object({}).strict(),

  params: z
    .object({
      id: z
        .string({
          error: "Category ID is required",
        })
        .uuid(
          "Category ID must be a valid UUID",
        ),
    })
    .strict(),

  query: z.object({}).strict(),
});

export const categoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
  categoryIdValidationSchema,
};