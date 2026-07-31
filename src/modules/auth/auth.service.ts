import bcrypt from "bcryptjs";
import type { SignOptions } from "jsonwebtoken";

import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
  IJwtPayload,
  ILoginUser,
  RegisterUserPayload,
} from "./auth.interface";

const registerUserIntoDB = async (
  payload: RegisterUserPayload,
) => {
  const normalizedEmail = payload.email
    .trim()
    .toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError(
      409,
      "User with this email already exists",
      {
        field: "email",
      },
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: payload.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const loginUser = async (
  payload: ILoginUser,
) => {
  const normalizedEmail = payload.email
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new AppError(
      401,
      "The email is incorrect or not found",
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

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      401,
      "Password is incorrect",
    );
  }

  const jwtPayload: IJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeStatus: user.activeStatus,
    },
  };
};

const getMyProfileFromDB = async (
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          id: true,
          profilePhoto: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(
      404,
      "User profile not found",
    );
  }

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUser,
  getMyProfileFromDB,
};