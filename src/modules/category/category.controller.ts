import type {
  Request,
  Response,
} from "express";

import catchAsync from "../../utils/catchAsync";
import type {
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";
import { categoryService } from "./category.service";

type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

type CategoryIdParams = {
  id: string;
};

const createCategory = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<ICreateCategoryPayload>;

    const result =
      await categoryService.createCategoryIntoDB(
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (
    _req: Request,
    res: Response,
  ): Promise<void> => {
    const result =
      await categoryService.getAllCategoriesFromDB();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

const getCategoryById = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        CategoryIdParams
      >;

    const result =
      await categoryService.getCategoryByIdFromDB(
        validatedData.params.id,
      );

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        IUpdateCategoryPayload,
        CategoryIdParams
      >;

    const result =
      await categoryService.updateCategoryIntoDB(
        validatedData.params.id,
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const validatedData =
      req.validatedData as ValidatedRequestData<
        Record<string, never>,
        CategoryIdParams
      >;

    const result =
      await categoryService.deleteCategoryFromDB(
        validatedData.params.id,
      );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};