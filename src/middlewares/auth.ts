import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";

import config from "../config";
import AppError from "../errors/AppError";
import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

const allowedRoles: Role[] = [
  "CUSTOMER",
  "PROVIDER",
  "ADMIN",
];

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(
    async (
      req: Request,
      _res: Response,
      next: NextFunction,
    ): Promise<void> => {
      const authorizationHeader =
        req.headers.authorization;

      const cookieToken =
        typeof req.cookies?.accessToken === "string"
          ? req.cookies.accessToken
          : undefined;

      let token = cookieToken;

      if (!token && authorizationHeader) {
        token = authorizationHeader.startsWith(
          "Bearer ",
        )
          ? authorizationHeader.slice(7).trim()
          : authorizationHeader.trim();
      }

      if (!token) {
        throw new AppError(
          401,
          "You are not logged in. Please log in to access this resource.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        token,
        config.jwt_access_secret,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          401,
          "Invalid or expired access token",
          {
            reason: verifiedToken.error,
          },
        );
      }

      const decodedToken = verifiedToken.data;

      if (
        typeof decodedToken === "string"
      ) {
        throw new AppError(
          401,
          "Invalid access token payload",
        );
      }

      const {
        id,
        email,
        role,
      } = decodedToken as JwtPayload;

      if (
        typeof id !== "string" ||
        typeof email !== "string" ||
        typeof role !== "string" ||
        !allowedRoles.includes(role as Role)
      ) {
        throw new AppError(
          401,
          "Invalid access token payload",
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          activeStatus: true,
        },
      });

      if (!user) {
        throw new AppError(
          401,
          "User not found. Please log in again.",
        );
      }

      if (user.email !== email) {
        throw new AppError(
          401,
          "User information has changed. Please log in again.",
        );
      }

      if (user.activeStatus === "SUSPENDED") {
        throw new AppError(
          403,
          "Your account has been suspended. Please contact support.",
        );
      }

      if (user.activeStatus === "INACTIVE") {
        throw new AppError(
          403,
          "Your account is currently inactive.",
        );
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(user.role)
      ) {
        throw new AppError(
          403,
          "You do not have permission to access this resource.",
          {
            requiredRoles,
            currentRole: user.role,
          },
        );
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    },
  );
};