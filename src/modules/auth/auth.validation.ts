import { z } from "zod";

const passwordValidation = z
  .string({
    error: "Password is required",
  })
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
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

const registerUserValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          error: "Name is required",
        })
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

      email: z
        .string({
          error: "Email is required",
        })
        .trim()
        .toLowerCase()
        .email("A valid email address is required"),

      password: passwordValidation,

      role: z.enum(["CUSTOMER", "PROVIDER"], {
        error: "Role must be CUSTOMER or PROVIDER",
      }),
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

const loginUserValidationSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          error: "Email is required",
        })
        .trim()
        .toLowerCase()
        .email("A valid email address is required"),

      password: z
        .string({
          error: "Password is required",
        })
        .min(1, "Password is required"),
    })
    .strict(),

  params: z.object({}).strict(),

  query: z.object({}).strict(),
});

export const authValidation = {
  registerUserValidationSchema,
  loginUserValidationSchema,
};