import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

export type VerifyTokenResult =
  | {
      success: true;
      data: string | JwtPayload;
    }
  | {
      success: false;
      error: string;
    };

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

const verifyToken = (
  token: string,
  secret: string,
): VerifyTokenResult => {
  try {
    const verifiedToken = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Token verification failed";

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};