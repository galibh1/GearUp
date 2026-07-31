import { z } from "zod";

const passwordSchema = z
  .string()
  .min(
    8,
    "Password must contain at least 8 characters",
  )
  .max(
    72,
    "Password cannot exceed 72 characters",
  )
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number",
  );

const registerValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Name must contain at least 2 characters",
        )
        .max(
          100,
          "Name cannot exceed 100 characters",
        ),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email(
          "A valid email address is required",
        ),

      password: passwordSchema,

      role: z.enum(
        ["CUSTOMER", "PROVIDER"],
        {
          message:
            "Role must be CUSTOMER or PROVIDER",
        },
      ),
    })
    .strict(),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

const loginValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email(
          "A valid email address is required",
        ),

      password: z
        .string()
        .min(
          1,
          "Password is required",
        ),
    })
    .strict(),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

const refreshTokenValidationSchema = z.object({
  body: z
    .object({
      refreshToken: z
        .string()
        .trim()
        .min(
          1,
          "Refresh token is required",
        ),
    })
    .strict(),

  params: z.object({}).strict(),
  query: z.object({}).strict(),
});

type RegisterValidatedData = z.infer<
  typeof registerValidationSchema
>;

type LoginValidatedData = z.infer<
  typeof loginValidationSchema
>;

type RefreshTokenValidatedData = z.infer<
  typeof refreshTokenValidationSchema
>;

export type RegisterRequestBody =
  RegisterValidatedData["body"];

export type LoginRequestBody =
  LoginValidatedData["body"];

export type RefreshTokenRequestBody =
  RefreshTokenValidatedData["body"];

export {
  loginValidationSchema,
  refreshTokenValidationSchema,
  registerValidationSchema,
};