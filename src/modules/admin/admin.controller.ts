import type {
  Request,
  Response,
} from "express";

import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import type {
  IAdminGearQuery,
  IAdminRentalQuery,
  IAdminUserQuery,
  IUpdateUserStatusPayload,
} from "./admin.interface";
import { adminService } from "./admin.service";


type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};


type AdminUserIdParams = {
  id: string;
};


/**
 * GET /api/admin/users
 */
const getAllUsers = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        Record<string, never>,
        IAdminUserQuery
      >;


    const result =
      await adminService.getAllUsersFromDB(
        validatedData.query,
      );


    res.status(200).json({
      success: true,
      message:
        "Users retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);


/**
 * GET /api/admin/users/:id
 */
const getUserById = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        AdminUserIdParams
      >;


    const result =
      await adminService.getUserByIdFromDB(
        validatedData.params.id,
      );


    res.status(200).json({
      success: true,
      message:
        "User retrieved successfully",
      data: result,
    });
  },
);


/**
 * PATCH /api/admin/users/:id
 */
const updateUserStatus = catchAsync(
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


    const validatedData =
      req.validatedData as ValidatedRequestData<
        IUpdateUserStatusPayload,
        AdminUserIdParams
      >;


    const result =
      await adminService.updateUserStatusIntoDB(
        req.user.id,
        validatedData.params.id,
        validatedData.body,
      );


    res.status(200).json({
      success: true,
      message:
        "User status updated successfully",
      data: result,
    });
  },
);


/**
 * GET /api/admin/gear
 */
const getAllGear = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        Record<string, never>,
        IAdminGearQuery
      >;


    const result =
      await adminService.getAllGearFromDB(
        validatedData.query,
      );


    res.status(200).json({
      success: true,
      message:
        "Gear items retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);


/**
 * GET /api/admin/rentals
 */
const getAllRentals = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        Record<string, never>,
        IAdminRentalQuery
      >;


    const result =
      await adminService.getAllRentalsFromDB(
        validatedData.query,
      );


    res.status(200).json({
      success: true,
      message:
        "Rental orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);


export const adminController = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};