import { Prisma } from "../../../generated/prisma/client";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  ICreateGearPayload,
  IGearQuery,
  IPaginationMeta,
  IUpdateGearPayload,
} from "./gear.interface";

const gearInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  },

  provider: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  reviews: {
    where: {
      isVisible: true,
    },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },

  _count: {
    select: {
      reviews: true,
      rentalItems: true,
    },
  },
};

const checkCategory = async (
  categoryId: string,
): Promise<void> => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!category) {
    throw new AppError(
      404,
      "Category not found",
      {
        field: "categoryId",
      },
    );
  }

  if (!category.isActive) {
    throw new AppError(
      400,
      "Gear cannot be assigned to an inactive category",
      {
        field: "categoryId",
      },
    );
  }
};

const checkDuplicateSlug = async (
  slug: string,
  excludedGearId?: string,
): Promise<void> => {
  const existingGear = await prisma.gearItem.findFirst({
    where: {
      slug,
      ...(excludedGearId && {
        id: {
          not: excludedGearId,
        },
      }),
    },
    select: {
      id: true,
    },
  });

  if (existingGear) {
    throw new AppError(
      409,
      "A gear item with this slug already exists",
      {
        field: "slug",
      },
    );
  }
};

const createGearIntoDB = async (
  providerId: string,
  payload: ICreateGearPayload,
) => {
  await checkCategory(payload.categoryId);

  const normalizedSlug = payload.slug
    .trim()
    .toLowerCase();

  await checkDuplicateSlug(normalizedSlug);

  const availableStock =
    payload.availableStock ?? payload.stock;

  if (availableStock > payload.stock) {
    throw new AppError(
      400,
      "Available stock cannot exceed total stock",
      {
        stock: payload.stock,
        availableStock,
      },
    );
  }

  const result = await prisma.gearItem.create({
    data: {
      name: payload.name.trim(),
      slug: normalizedSlug,
      description: payload.description.trim(),

      brand: payload.brand?.trim(),

      pricePerDay: payload.pricePerDay,
      depositAmount:
        payload.depositAmount ?? 0,

      stock: payload.stock,
      availableStock,

      condition:
        payload.condition ?? "GOOD",

      status:
        payload.status ??
        (availableStock > 0
          ? "AVAILABLE"
          : "UNAVAILABLE"),

      imageUrls: payload.imageUrls ?? [],

      specifications:
        payload.specifications as
          | Prisma.InputJsonValue
          | undefined,

      location: payload.location?.trim(),

      isFeatured:
        payload.isFeatured ?? false,

      category: {
        connect: {
          id: payload.categoryId,
        },
      },

      provider: {
        connect: {
          id: providerId,
        },
      },
    },

    include: gearInclude,
  });

  return result;
};

const getAllGearFromDB = async (
  query: IGearQuery,
) => {
  const andConditions: Prisma.GearItemWhereInput[] = [
    {
      status: {
        not: "ARCHIVED",
      },
    },
  ];

  if (query.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.category) {
    andConditions.push({
      category: {
        OR: [
          {
            name: {
              equals: query.category,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: query.category,
              mode: "insensitive",
            },
          },
        ],
      },
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: {
        contains: query.brand,
        mode: "insensitive",
      },
    });
  }

  if (query.condition) {
    andConditions.push({
      condition: query.condition,
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  if (
    query.minPrice !== undefined ||
    query.maxPrice !== undefined
  ) {
    const priceFilter: Prisma.DecimalFilter = {};

    if (query.minPrice !== undefined) {
      priceFilter.gte = query.minPrice;
    }

    if (query.maxPrice !== undefined) {
      priceFilter.lte = query.maxPrice;
    }

    andConditions.push({
      pricePerDay: priceFilter,
    });
  }

  if (query.available === true) {
    andConditions.push({
      availableStock: {
        gt: 0,
      },
      status: "AVAILABLE",
    });
  }

  if (query.available === false) {
    andConditions.push({
      availableStock: 0,
    });
  }

  if (query.isFeatured !== undefined) {
    andConditions.push({
      isFeatured: query.isFeatured,
    });
  }

  const where: Prisma.GearItemWhereInput = {
    AND: andConditions,
  };

  const skip =
    (query.page - 1) * query.limit;

  const orderBy =
    {
      [query.sortBy]: query.sortOrder,
    } as Prisma.GearItemOrderByWithRelationInput;

  const [gearItems, total] =
    await prisma.$transaction([
      prisma.gearItem.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: gearInclude,
      }),

      prisma.gearItem.count({
        where,
      }),
    ]);

  const meta: IPaginationMeta = {
    page: query.page,
    limit: query.limit,
    total,
    totalPages:
      total === 0
        ? 0
        : Math.ceil(total / query.limit),
  };

  return {
    meta,
    data: gearItems,
  };
};

const getSingleGearFromDB = async (
  gearId: string,
) => {
  const gear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      status: {
        not: "ARCHIVED",
      },
    },

    include: gearInclude,
  });

  if (!gear) {
    throw new AppError(
      404,
      "Gear item not found",
    );
  }

  return gear;
};

const updateGearIntoDB = async (
  gearId: string,
  providerId: string,
  payload: IUpdateGearPayload,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },
  });

  if (!gear) {
    throw new AppError(
      404,
      "Gear item not found",
    );
  }

  if (gear.providerId !== providerId) {
    throw new AppError(
      403,
      "You are not the owner of this gear item",
    );
  }

  if (payload.categoryId) {
    await checkCategory(payload.categoryId);
  }

  const normalizedSlug =
    payload.slug?.trim().toLowerCase();

  if (normalizedSlug) {
    await checkDuplicateSlug(
      normalizedSlug,
      gearId,
    );
  }

  const currentlyReservedStock =
    gear.stock - gear.availableStock;

  const targetStock =
    payload.stock ?? gear.stock;

  if (targetStock < currentlyReservedStock) {
    throw new AppError(
      400,
      "Stock cannot be reduced below the currently rented quantity",
      {
        currentStock: gear.stock,
        availableStock: gear.availableStock,
        rentedQuantity: currentlyReservedStock,
        requestedStock: targetStock,
      },
    );
  }

  let targetAvailableStock:
    | number
    | undefined;

  if (payload.availableStock !== undefined) {
    targetAvailableStock =
      payload.availableStock;
  } else if (payload.stock !== undefined) {
    targetAvailableStock =
      targetStock - currentlyReservedStock;
  }

  if (
    targetAvailableStock !== undefined &&
    targetAvailableStock > targetStock
  ) {
    throw new AppError(
      400,
      "Available stock cannot exceed total stock",
      {
        stock: targetStock,
        availableStock:
          targetAvailableStock,
      },
    );
  }

  const result = await prisma.gearItem.update({
    where: {
      id: gearId,
    },

    data: {
      ...(payload.name !== undefined && {
        name: payload.name.trim(),
      }),

      ...(normalizedSlug !== undefined && {
        slug: normalizedSlug,
      }),

      ...(payload.description !== undefined && {
        description:
          payload.description.trim(),
      }),

      ...(payload.brand !== undefined && {
        brand:
          payload.brand === null
            ? null
            : payload.brand.trim(),
      }),

      ...(payload.pricePerDay !== undefined && {
        pricePerDay:
          payload.pricePerDay,
      }),

      ...(payload.depositAmount !== undefined && {
        depositAmount:
          payload.depositAmount,
      }),

      ...(payload.stock !== undefined && {
        stock: targetStock,
      }),

      ...(targetAvailableStock !== undefined && {
        availableStock:
          targetAvailableStock,
      }),

      ...(payload.condition !== undefined && {
        condition: payload.condition,
      }),

      ...(payload.status !== undefined && {
        status: payload.status,
      }),

      ...(payload.imageUrls !== undefined && {
        imageUrls: payload.imageUrls,
      }),

      ...(payload.specifications !== undefined && {
        specifications:
          payload.specifications === null
            ? Prisma.DbNull
            : (payload.specifications as Prisma.InputJsonValue),
      }),

      ...(payload.location !== undefined && {
        location:
          payload.location === null
            ? null
            : payload.location.trim(),
      }),

      ...(payload.isFeatured !== undefined && {
        isFeatured:
          payload.isFeatured,
      }),

      ...(payload.categoryId !== undefined && {
        category: {
          connect: {
            id: payload.categoryId,
          },
        },
      }),
    },

    include: gearInclude,
  });

  return result;
};

const deleteGearFromDB = async (
  gearId: string,
  providerId: string,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },

    include: {
      _count: {
        select: {
          rentalItems: true,
          reviews: true,
        },
      },
    },
  });

  if (!gear) {
    throw new AppError(
      404,
      "Gear item not found",
    );
  }

  if (gear.providerId !== providerId) {
    throw new AppError(
      403,
      "You are not the owner of this gear item",
    );
  }

  if (
    gear._count.rentalItems > 0 ||
    gear._count.reviews > 0
  ) {
    const archivedGear =
      await prisma.gearItem.update({
        where: {
          id: gearId,
        },

        data: {
          status: "ARCHIVED",
          availableStock: 0,
          isFeatured: false,
        },
      });

    return {
      action: "ARCHIVED",
      gear: archivedGear,
    };
  }

  const deletedGear =
    await prisma.gearItem.delete({
      where: {
        id: gearId,
      },
    });

  return {
    action: "DELETED",
    gear: deletedGear,
  };
};

const getMyGearFromDB = async (
  providerId: string,
) => {
  const result = await prisma.gearItem.findMany({
    where: {
      providerId,
    },

    include: gearInclude,

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const gearService = {
  createGearIntoDB,
  getAllGearFromDB,
  getSingleGearFromDB,
  updateGearIntoDB,
  deleteGearFromDB,
  getMyGearFromDB,
};