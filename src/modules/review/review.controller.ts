import type {
  Request,
  Response,
} from "express";

import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import type {
  ICreateReviewPayload,
  IReviewQuery,
  IUpdateReviewPayload,
} from "./review.interface";
import { reviewService } from "./review.service";

type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

type ReviewIdParams = {
  id: string;
};

type GearReviewParams = {
  gearItemId: string;
};

const createReview = catchAsync(
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
      req.validatedData as ValidatedRequestData<ICreateReviewPayload>;

    const result =
      await reviewService.createReviewIntoDB(
        req.user.id,
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message:
        "Review submitted successfully",
      data: result,
    });
  },
);

const getGearReviews = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        GearReviewParams,
        IReviewQuery
      >;

    const result =
      await reviewService.getGearReviewsFromDB(
        validatedData.params.gearItemId,
        validatedData.query,
      );

    res.status(200).json({
      success: true,
      message:
        "Gear reviews retrieved successfully",
      gearItem: result.gearItem,
      summary: result.summary,
      meta: result.meta,
      data: result.data,
    });
  },
);

const getReviewById = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        ReviewIdParams
      >;

    const result =
      await reviewService.getReviewByIdFromDB(
        validatedData.params.id,
      );

    res.status(200).json({
      success: true,
      message:
        "Review retrieved successfully",
      data: result,
    });
  },
);

const updateReview = catchAsync(
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
        IUpdateReviewPayload,
        ReviewIdParams
      >;

    const result =
      await reviewService.updateReviewIntoDB(
        validatedData.params.id,
        req.user.id,
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message:
        "Review updated successfully",
      data: result,
    });
  },
);

const deleteReview = catchAsync(
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
        ReviewIdParams
      >;

    const result =
      await reviewService.deleteReviewFromDB(
        validatedData.params.id,
        req.user.id,
      );

    res.status(200).json({
      success: true,
      message:
        "Review deleted successfully",
      data: result,
    });
  },
);

export const reviewController = {
  createReview,
  getGearReviews,
  getReviewById,
  updateReview,
  deleteReview,
};