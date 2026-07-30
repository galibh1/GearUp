import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const getRequiredEnvironmentVariable = (key: string): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getNumberEnvironmentVariable = (
  value: string | undefined,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getAllowedOrigins = (): string[] => {
  const appUrl = process.env.APP_URL ?? "http://localhost:8000";

  return appUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: getNumberEnvironmentVariable(process.env.PORT, 8000),

  DATABASE_URL: getRequiredEnvironmentVariable("DATABASE_URL"),

  app_url: getAllowedOrigins(),

  bcrypt_salt_rounds: getNumberEnvironmentVariable(
    process.env.BCRYPT_SALT_ROUNDS,
    12,
  ),

  jwt_access_secret: getRequiredEnvironmentVariable(
    "JWT_ACCESS_SECRET",
  ),

  jwt_access_expires_in:
    process.env.JWT_ACCESS_EXPIRATION ?? "7d",

  jwt_refresh_secret:
    process.env.JWT_REFRESH_SECRET ?? "",

  jwt_refresh_expires_in:
    process.env.JWT_REFRESH_EXPIRATION ?? "30d",

  stripe_secret_key:
    process.env.STRIPE_SECRET_KEY ?? "",

  stripe_webhook_secret:
    process.env.STRIPE_WEBHOOK_SECRET ?? "",

  stripe_currency:
    (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase(),

  payment_success_url:
    process.env.PAYMENT_SUCCESS_URL ??
    "http://localhost:8000/payment/success",

  payment_cancel_url:
    process.env.PAYMENT_CANCEL_URL ??
    "http://localhost:8000/payment/cancel",

  admin_name:
    process.env.ADMIN_NAME ?? "GearUp Admin",

  admin_email:
    process.env.ADMIN_EMAIL ?? "admin@gearup.com",

  admin_password:
    process.env.ADMIN_PASSWORD ?? "Admin123!",
} as const;

export default config;