import type {
  Request,
  Response,
} from "express";

import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import type {
  ILoginUser,
  RegisterUserPayload,
} from "./auth.interface";
import { authService } from "./auth.service";

type ValidatedRequestData<T> = {
  body: T;
  params: Record<string, never>;
  query: Record<string, never>;
};

const registerUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<RegisterUserPayload>;

    const result =
      await authService.registerUserIntoDB(
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  },
);

const loginUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<ILoginUser>;

    const result =
      await authService.loginUser(
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  },
);

const getMyProfile = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!req.user) {
      throw new AppError(
        401,
        "Authentication is required",
      );
    }

    const result =
      await authService.getMyProfileFromDB(
        req.user.id,
      );

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: result,
    });
  },
);

export const authController = {
  registerUser,
  loginUser,
  getMyProfile,
};