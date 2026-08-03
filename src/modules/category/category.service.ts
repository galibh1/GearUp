import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";

const createCategoryIntoDB = async (
  payload: ICreateCategoryPayload,
) => {
  const normalizedName = payload.name.trim();
  const normalizedSlug = payload.slug
    .trim()
    .toLowerCase();

  const existingCategory =
    await prisma.category.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: normalizedName,
              mode: "insensitive",
            },
          },
          {
            slug: normalizedSlug,
          },
        ],
      },
    });

  if (existingCategory) {
    if (
      existingCategory.slug === normalizedSlug
    ) {
      throw new AppError(
        409,
        "A category with this slug already exists",
        {
          field: "slug",
        },
      );
    }

    throw new AppError(
      409,
      "A category with this name already exists",
      {
        field: "name",
      },
    );
  }

  const result = await prisma.category.create({
    data: {
      name: normalizedName,
      slug: normalizedSlug,
      description:
        payload.description?.trim(),
      imageUrl: payload.imageUrl?.trim(),
      isActive: payload.isActive ?? true,
    },
  });

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          gearItems: true,
        },
      },
    },
  });

  return result;
};

const getCategoryByIdFromDB = async (
  categoryId: string,
) => {
  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            gearItems: true,
          },
        },
      },
    });

  if (!category) {
    throw new AppError(
      404,
      "Category not found",
    );
  }

  return category;
};

const updateCategoryIntoDB = async (
  categoryId: string,
  payload: IUpdateCategoryPayload,
) => {
  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

  if (!category) {
    throw new AppError(
      404,
      "Category not found",
    );
  }

  const normalizedName =
    payload.name?.trim();

  const normalizedSlug =
    payload.slug?.trim().toLowerCase();

  if (normalizedName || normalizedSlug) {
    const duplicateCategory =
      await prisma.category.findFirst({
        where: {
          id: {
            not: categoryId,
          },
          OR: [
            ...(normalizedName
              ? [
                  {
                    name: {
                      equals: normalizedName,
                      mode: "insensitive" as const,
                    },
                  },
                ]
              : []),

            ...(normalizedSlug
              ? [
                  {
                    slug: normalizedSlug,
                  },
                ]
              : []),
          ],
        },
      });

    if (duplicateCategory) {
      if (
        normalizedSlug &&
        duplicateCategory.slug ===
          normalizedSlug
      ) {
        throw new AppError(
          409,
          "A category with this slug already exists",
          {
            field: "slug",
          },
        );
      }

      throw new AppError(
        409,
        "A category with this name already exists",
        {
          field: "name",
        },
      );
    }
  }

  const result = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...(normalizedName !== undefined && {
        name: normalizedName,
      }),

      ...(normalizedSlug !== undefined && {
        slug: normalizedSlug,
      }),

      ...(payload.description !== undefined && {
        description:
          payload.description.trim(),
      }),

      ...(payload.imageUrl !== undefined && {
        imageUrl: payload.imageUrl.trim(),
      }),

      ...(payload.isActive !== undefined && {
        isActive: payload.isActive,
      }),
    },
  });

  return result;
};

const deleteCategoryFromDB = async (
  categoryId: string,
) => {
  const category =
    await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            gearItems: true,
          },
        },
      },
    });

  if (!category) {
    throw new AppError(
      404,
      "Category not found",
    );
  }

  if (category._count.gearItems > 0) {
    throw new AppError(
      409,
      "Category cannot be deleted because gear items are assigned to it",
      {
        gearItemCount:
          category._count.gearItems,
      },
    );
  }

  const result = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return result;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getCategoryByIdFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};