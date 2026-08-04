import type {
  Prisma,
} from "../../../generated/prisma/client";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  IAdminGearQuery,
  IAdminPaginationMeta,
  IAdminRentalQuery,
  IAdminUserQuery,
  IUpdateUserStatusPayload,
} from "./admin.interface";


const adminUserSelect = {
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
    },
  },

  _count: {
    select: {
      gearItems: true,
      customerRentals: true,
      providerRentals: true,
      payments: true,
      reviews: true,
    },
  },
} satisfies Prisma.UserSelect;


const createPaginationMeta = (
  query:
    | IAdminUserQuery
    | IAdminGearQuery
    | IAdminRentalQuery,
  total: number,
): IAdminPaginationMeta => {
  return {
    page: query.page,
    limit: query.limit,
    total,

    totalPages:
      total === 0
        ? 0
        : Math.ceil(
            total / query.limit,
          ),
  };
};


const getAllUsersFromDB = async (
  query: IAdminUserQuery,
) => {
  const where: Prisma.UserWhereInput = {
    role:
      query.role === "ALL"
        ? {
            in: [
              "CUSTOMER",
              "PROVIDER",
            ],
          }
        : query.role,

    ...(query.activeStatus !==
      "ALL" && {
      activeStatus:
        query.activeStatus,
    }),

    ...(query.searchTerm && {
      OR: [
        {
          name: {
            contains:
              query.searchTerm,
            mode: "insensitive",
          },
        },

        {
          email: {
            contains:
              query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    }),
  };


  const skip =
    (query.page - 1) *
    query.limit;


  const orderBy:
    Prisma.UserOrderByWithRelationInput = {
    [query.sortBy]:
      query.sortOrder,
  };


  const [
    users,
    total,
  ] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: query.limit,
      orderBy,
      select: adminUserSelect,
    }),

    prisma.user.count({
      where,
    }),
  ]);


  return {
    meta:
      createPaginationMeta(
        query,
        total,
      ),

    data: users,
  };
};


const getUserByIdFromDB = async (
  userId: string,
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: adminUserSelect,
    });


  if (!user) {
    throw new AppError(
      404,
      "User not found",
    );
  }


  if (user.role === "ADMIN") {
    throw new AppError(
      403,
      "Admin accounts cannot be managed through this endpoint",
    );
  }


  return user;
};


const updateUserStatusIntoDB =
  async (
    adminId: string,
    userId: string,
    payload: IUpdateUserStatusPayload,
  ) => {

    if (adminId === userId) {
      throw new AppError(
        403,
        "You cannot change the status of your own admin account",
      );
    }


    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
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
        404,
        "User not found",
      );
    }


    if (user.role === "ADMIN") {
      throw new AppError(
        403,
        "Admin accounts cannot be suspended or deactivated",
      );
    }


    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        activeStatus:
          payload.activeStatus,
      },

      select: adminUserSelect,
    });
  };


const getAllGearFromDB = async (
  query: IAdminGearQuery,
) => {

  const where:
    Prisma.GearItemWhereInput = {

    ...(query.searchTerm && {
      OR: [
        {
          name: {
            contains:
              query.searchTerm,
            mode: "insensitive",
          },
        },

        {
          brand: {
            contains:
              query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(query.categoryId && {
      categoryId:
        query.categoryId,
    }),

    ...(query.providerId && {
      providerId:
        query.providerId,
    }),
  };


  const skip =
    (query.page - 1) *
    query.limit;


  const [
    gear,
    total,
  ] = await prisma.$transaction([
    prisma.gearItem.findMany({
      where,
      skip,
      take: query.limit,

      orderBy: {
        createdAt:
          query.sortOrder,
      },

      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.gearItem.count({
      where,
    }),
  ]);


  return {
    meta:
      createPaginationMeta(
        query,
        total,
      ),

    data: gear,
  };
};


const getAllRentalsFromDB = async (
  query: IAdminRentalQuery,
) => {

  const where:
    Prisma.RentalOrderWhereInput = {

    ...(query.status && {
      status:
        query.status,
    }),

    ...(query.customerId && {
      customerId:
        query.customerId,
    }),

    ...(query.providerId && {
      providerId:
        query.providerId,
    }),
  };


  const skip =
    (query.page - 1) *
    query.limit;


  const [
    rentals,
    total,
  ] = await prisma.$transaction([

    prisma.rentalOrder.findMany({
      where,

      skip,

      take: query.limit,

      orderBy: {
        createdAt:
          query.sortOrder,
      },

      include: {

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },


        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },


        items: {
          include: {
            gearItem: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },


        payments: true,
      },
    }),


    prisma.rentalOrder.count({
      where,
    }),

  ]);


  return {
    meta:
      createPaginationMeta(
        query,
        total,
      ),

    data: rentals,
  };
};


export const adminService = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserStatusIntoDB,
  getAllGearFromDB,
  getAllRentalsFromDB,
};