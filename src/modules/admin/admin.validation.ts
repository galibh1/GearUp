import { z } from "zod";


const adminUsersQueryValidationSchema =
  z.object({
    body: z
      .object({})
      .strict(),

    params: z
      .object({})
      .strict(),

    query: z
      .object({
        searchTerm: z
          .string()
          .trim()
          .min(
            1,
            "Search term cannot be empty",
          )
          .optional(),

        role: z
          .enum([
            "ALL",
            "CUSTOMER",
            "PROVIDER",
          ])
          .default("ALL"),

        activeStatus: z
          .enum([
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "SUSPENDED",
          ])
          .default("ALL"),

        page: z.coerce
          .number()
          .int(
            "Page must be an integer",
          )
          .positive(
            "Page must be greater than zero",
          )
          .default(1),

        limit: z.coerce
          .number()
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
            "email",
          ])
          .default("createdAt"),

        sortOrder: z
          .enum([
            "asc",
            "desc",
          ])
          .default("desc"),
      })
      .strict(),
  });


const adminUserIdValidationSchema =
  z.object({
    body: z
      .object({})
      .strict(),

    params: z
      .object({
        id: z
          .string()
          .trim()
          .uuid(
            "A valid user ID is required",
          ),
      })
      .strict(),

    query: z
      .object({})
      .strict(),
  });


const updateUserStatusValidationSchema =
  z.object({
    body: z
      .object({
        activeStatus: z.enum([
          "ACTIVE",
          "INACTIVE",
          "SUSPENDED",
        ]),
      })
      .strict(),

    params: z
      .object({
        id: z
          .string()
          .trim()
          .uuid(
            "A valid user ID is required",
          ),
      })
      .strict(),

    query: z
      .object({})
      .strict(),
  });


/**
 * GET /api/admin/gear
 */
const adminGearQueryValidationSchema =
  z.object({
    body: z
      .object({})
      .strict(),

    params: z
      .object({})
      .strict(),

    query: z
      .object({
        searchTerm: z
          .string()
          .trim()
          .min(
            1,
            "Search term cannot be empty",
          )
          .optional(),

        categoryId: z
          .string()
          .uuid(
            "Category ID must be valid",
          )
          .optional(),

        providerId: z
          .string()
          .uuid(
            "Provider ID must be valid",
          )
          .optional(),

        page: z.coerce
          .number()
          .int()
          .positive()
          .default(1),

        limit: z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
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


/**
 * GET /api/admin/rentals
 */
const adminRentalQueryValidationSchema =
  z.object({
    body: z
      .object({})
      .strict(),

    params: z
      .object({})
      .strict(),

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

        customerId: z
          .string()
          .uuid(
            "Customer ID must be valid",
          )
          .optional(),

        providerId: z
          .string()
          .uuid(
            "Provider ID must be valid",
          )
          .optional(),

        page: z.coerce
          .number()
          .int()
          .positive()
          .default(1),

        limit: z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
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


type AdminUsersQueryValidatedData =
  z.infer<
    typeof adminUsersQueryValidationSchema
  >;


type AdminGearQueryValidatedData =
  z.infer<
    typeof adminGearQueryValidationSchema
  >;


type AdminRentalQueryValidatedData =
  z.infer<
    typeof adminRentalQueryValidationSchema
  >;


type UpdateUserStatusValidatedData =
  z.infer<
    typeof updateUserStatusValidationSchema
  >;


export type AdminUsersQuery =
  AdminUsersQueryValidatedData["query"];


export type AdminGearQuery =
  AdminGearQueryValidatedData["query"];


export type AdminRentalQuery =
  AdminRentalQueryValidatedData["query"];


export type UpdateUserStatusRequestBody =
  UpdateUserStatusValidatedData["body"];


export const adminValidation = {
  adminUsersQueryValidationSchema,

  adminUserIdValidationSchema,

  updateUserStatusValidationSchema,

  adminGearQueryValidationSchema,

  adminRentalQueryValidationSchema,
};