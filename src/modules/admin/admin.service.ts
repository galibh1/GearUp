import type {
  Prisma,
} from "../../../generated/prisma/client";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  IAdminPaginationMeta,
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
  query: IAdminUserQuery,
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
    /*
     * Admin accounts are excluded because this
     * endpoint is intended for managing customers
     * and providers.
     */
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

    if (
      user.activeStatus ===
      payload.activeStatus
    ) {
      throw new AppError(
        409,
        `User account is already ${payload.activeStatus.toLowerCase()}`,
        {
          currentStatus:
            user.activeStatus,
          requestedStatus:
            payload.activeStatus,
        },
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          activeStatus:
            payload.activeStatus,
        },

        select: adminUserSelect,
      });

    return updatedUser;
  };

export const adminService = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserStatusIntoDB,
};