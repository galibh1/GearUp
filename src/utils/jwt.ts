import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";
import config from "../config/index.js";

export type UserRole =
  | "CUSTOMER"
  | "PROVIDER"
  | "ADMIN";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

const allowedRoles: UserRole[] = [
  "CUSTOMER",
  "PROVIDER",
  "ADMIN",
];

const createToken = (
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn:
      expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    payload,
    secret,
    options,
  );
};

const validateDecodedPayload = (
  decodedPayload: string | JwtPayload,
): AuthTokenPayload => {
  if (typeof decodedPayload === "string") {
    throw new Error("Invalid token payload");
  }

  const {
    userId,
    email,
    role,
  } = decodedPayload;

  if (
    typeof userId !== "string" ||
    typeof email !== "string" ||
    typeof role !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  if (!allowedRoles.includes(role as UserRole)) {
    throw new Error("Invalid user role in token");
  }

  return {
    userId,
    email,
    role: role as UserRole,
  };
};

const verifyToken = (
  token: string,
  secret: string,
): AuthTokenPayload => {
  const decodedPayload = jwt.verify(
    token,
    secret,
    {
      algorithms: ["HS256"],
    },
  );

  return validateDecodedPayload(decodedPayload);
};

const createAccessToken = (
  payload: AuthTokenPayload,
): string => {
  return createToken(
    payload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
};

const createRefreshToken = (
  payload: AuthTokenPayload,
): string => {
  if (!config.jwt_refresh_secret) {
    throw new Error(
      "JWT refresh secret is not configured",
    );
  }

  return createToken(
    payload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );
};

const verifyAccessToken = (
  token: string,
): AuthTokenPayload => {
  return verifyToken(
    token,
    config.jwt_access_secret,
  );
};

const verifyRefreshToken = (
  token: string,
): AuthTokenPayload => {
  if (!config.jwt_refresh_secret) {
    throw new Error(
      "JWT refresh secret is not configured",
    );
  }

  return verifyToken(
    token,
    config.jwt_refresh_secret,
  );
};

export {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};