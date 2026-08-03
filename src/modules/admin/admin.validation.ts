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

type AdminUsersQueryValidatedData =
  z.infer<
    typeof adminUsersQueryValidationSchema
  >;

type UpdateUserStatusValidatedData =
  z.infer<
    typeof updateUserStatusValidationSchema
  >;

export type AdminUsersQuery =
  AdminUsersQueryValidatedData["query"];

export type UpdateUserStatusRequestBody =
  UpdateUserStatusValidatedData["body"];

export const adminValidation = {
  adminUsersQueryValidationSchema,
  adminUserIdValidationSchema,
  updateUserStatusValidationSchema,
};