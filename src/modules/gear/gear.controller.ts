import type {
  Request,
  Response,
} from "express";

import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import type {
  ICreateGearPayload,
  IGearQuery,
  IUpdateGearPayload,
} from "./gear.interface";
import { gearService } from "./gear.service";

type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

type GearIdParams = {
  id: string;
};

const createGear = catchAsync(
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
      req.validatedData as ValidatedRequestData<ICreateGearPayload>;

    const result =
      await gearService.createGearIntoDB(
        req.user.id,
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message: "Gear item created successfully",
      data: result,
    });
  },
);

const getAllGear = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        Record<string, never>,
        IGearQuery
      >;

    const result =
      await gearService.getAllGearFromDB(
        validatedData.query,
      );

    res.status(200).json({
      success: true,
      message: "Gear items retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getSingleGear = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        GearIdParams
      >;

    const result =
      await gearService.getSingleGearFromDB(
        validatedData.params.id,
      );

    res.status(200).json({
      success: true,
      message: "Gear item retrieved successfully",
      data: result,
    });
  },
);

const updateGear = catchAsync(
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
        IUpdateGearPayload,
        GearIdParams
      >;

    const result =
      await gearService.updateGearIntoDB(
        validatedData.params.id,
        req.user.id,
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message: "Gear item updated successfully",
      data: result,
    });
  },
);

const deleteGear = catchAsync(
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
        GearIdParams
      >;

    const result =
      await gearService.deleteGearFromDB(
        validatedData.params.id,
        req.user.id,
      );

    const message =
      result.action === "ARCHIVED"
        ? "Gear item archived successfully"
        : "Gear item deleted successfully";

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  },
);

const getMyGear = catchAsync(
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
      await gearService.getMyGearFromDB(
        req.user.id,
      );

    res.status(200).json({
      success: true,
      message:
        "Provider gear inventory retrieved successfully",
      data: result,
    });
  },
);

export const gearController = {
  createGear,
  getAllGear,
  getSingleGear,
  updateGear,
  deleteGear,
  getMyGear,
};