import type {
  Request,
  Response,
} from "express";

import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import type {
  ICreateRentalPayload,
  IRentalQuery,
  IUpdateRentalStatusPayload,
} from "./rental.interface";
import { rentalService } from "./rental.service";

type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

type RentalIdParams = {
  id: string;
};

const createRental = catchAsync(
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
      req.validatedData as ValidatedRequestData<ICreateRentalPayload>;

    const result =
      await rentalService.createRentalIntoDB(
        req.user.id,
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message: "Rental order created successfully",
      data: result,
    });
  },
);

const getMyRentals = catchAsync(
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
        Record<string, never>,
        Record<string, never>,
        IRentalQuery
      >;

    const result =
      await rentalService.getCustomerRentalsFromDB(
        req.user.id,
        validatedData.query,
      );

    res.status(200).json({
      success: true,
      message: "Rental orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getRentalById = catchAsync(
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
        Record<string, never>,
        RentalIdParams
      >;

    const result =
      await rentalService.getRentalByIdFromDB(
        validatedData.params.id,
        req.user.id,
        req.user.role,
      );

    res.status(200).json({
      success: true,
      message: "Rental order retrieved successfully",
      data: result,
    });
  },
);

const cancelRental = catchAsync(
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
        Record<string, never>,
        RentalIdParams
      >;

    const result =
      await rentalService.cancelRentalFromDB(
        validatedData.params.id,
        req.user.id,
      );

    res.status(200).json({
      success: true,
      message: "Rental order cancelled successfully",
      data: result,
    });
  },
);

const getProviderOrders = catchAsync(
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
        Record<string, never>,
        Record<string, never>,
        IRentalQuery
      >;

    const result =
      await rentalService.getProviderRentalsFromDB(
        req.user.id,
        validatedData.query,
      );

    res.status(200).json({
      success: true,
      message:
        "Provider rental orders retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const updateRentalStatus = catchAsync(
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
        IUpdateRentalStatusPayload,
        RentalIdParams
      >;

    const result =
      await rentalService.updateRentalStatusIntoDB(
        validatedData.params.id,
        req.user.id,
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message:
        "Rental order status updated successfully",
      data: result,
    });
  },
);

export const rentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  cancelRental,
  getProviderOrders,
  updateRentalStatus,
};