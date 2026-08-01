import {
  Prisma,
  type Role,
} from "../../../generated/prisma/client";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  ICreateRentalPayload,
  IRentalPaginationMeta,
  IRentalQuery,
  IUpdateRentalStatusPayload,
} from "./rental.interface";

const millisecondsPerDay =
  24 * 60 * 60 * 1000;

const rentalInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
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

  items: {
    include: {
      gearItem: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          imageUrls: true,
          status: true,
          providerId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "asc" as const,
    },
  },

  payments: {
    select: {
      id: true,
      amount: true,
      currency: true,
      paymentProvider: true,
      status: true,
      transactionId: true,
      stripeSessionId: true,
      paymentIntentId: true,
      paidAt: true,
      failedAt: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc" as const,
    },
  },

  reviews: {
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      gearItemId: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

const calculateRentalDays = (
  startDate: Date,
  endDate: Date,
): number => {
  const difference =
    endDate.getTime() -
    startDate.getTime();

  return Math.max(
    1,
    Math.ceil(
      difference / millisecondsPerDay,
    ),
  );
};

const createPaginationMeta = (
  query: IRentalQuery,
  total: number,
): IRentalPaginationMeta => {
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

const createRentalIntoDB = async (
  customerId: string,
  payload: ICreateRentalPayload,
) => {
  const startDate = new Date(
    payload.startDate,
  );

  const endDate = new Date(
    payload.endDate,
  );

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new AppError(
      400,
      "Invalid rental dates",
    );
  }

  if (startDate.getTime() < Date.now()) {
    throw new AppError(
      400,
      "Rental start date cannot be in the past",
    );
  }

  if (
    endDate.getTime() <=
    startDate.getTime()
  ) {
    throw new AppError(
      400,
      "Rental end date must be after the start date",
    );
  }

  const gearItemIds =
    payload.items.map(
      (item) => item.gearItemId,
    );

  const uniqueGearItemIds =
    new Set(gearItemIds);

  if (
    uniqueGearItemIds.size !==
    gearItemIds.length
  ) {
    throw new AppError(
      400,
      "The same gear item cannot be added more than once",
    );
  }

  const gearItems =
    await prisma.gearItem.findMany({
      where: {
        id: {
          in: gearItemIds,
        },
      },

      select: {
        id: true,
        name: true,
        pricePerDay: true,
        depositAmount: true,
        stock: true,
        availableStock: true,
        status: true,
        providerId: true,
      },
    });

  if (
    gearItems.length !==
    gearItemIds.length
  ) {
    const foundGearIds =
      new Set(
        gearItems.map(
          (gearItem) => gearItem.id,
        ),
      );

    const missingGearItemIds =
      gearItemIds.filter(
        (gearItemId) =>
          !foundGearIds.has(gearItemId),
      );

    throw new AppError(
      404,
      "One or more gear items were not found",
      {
        missingGearItemIds,
      },
    );
  }

  const providerIds =
    new Set(
      gearItems.map(
        (gearItem) =>
          gearItem.providerId,
      ),
    );

  if (providerIds.size !== 1) {
    throw new AppError(
      400,
      "All gear items in one rental order must belong to the same provider",
    );
  }

  const providerId =
    gearItems[0]?.providerId;

  if (!providerId) {
    throw new AppError(
      400,
      "Unable to determine the gear provider",
    );
  }

  const rentalDays =
    calculateRentalDays(
      startDate,
      endDate,
    );

  const gearItemMap =
    new Map(
      gearItems.map(
        (gearItem) => [
          gearItem.id,
          gearItem,
        ],
      ),
    );

  const rentalItems =
    payload.items.map((item) => {
      const gearItem =
        gearItemMap.get(
          item.gearItemId,
        );

      if (!gearItem) {
        throw new AppError(
          404,
          "Gear item not found",
          {
            gearItemId:
              item.gearItemId,
          },
        );
      }

      if (
        gearItem.status !==
        "AVAILABLE"
      ) {
        throw new AppError(
          409,
          `${gearItem.name} is currently unavailable`,
          {
            gearItemId:
              gearItem.id,
            status:
              gearItem.status,
          },
        );
      }

      if (
        gearItem.availableStock <
        item.quantity
      ) {
        throw new AppError(
          409,
          `Insufficient stock for ${gearItem.name}`,
          {
            gearItemId:
              gearItem.id,
            requestedQuantity:
              item.quantity,
            availableStock:
              gearItem.availableStock,
          },
        );
      }

      const pricePerDay =
        new Prisma.Decimal(
          gearItem.pricePerDay,
        );

      const depositPerUnit =
        new Prisma.Decimal(
          gearItem.depositAmount,
        );

      const itemSubtotal =
        pricePerDay
          .mul(item.quantity)
          .mul(rentalDays);

      const itemDeposit =
        depositPerUnit.mul(
          item.quantity,
        );

      return {
        gearItem,
        quantity: item.quantity,
        pricePerDay,
        rentalDays,
        subtotal: itemSubtotal,
        depositAmount:
          itemDeposit,
      };
    });

  const subtotal =
    rentalItems.reduce(
      (
        total,
        rentalItem,
      ) =>
        total.add(
          rentalItem.subtotal,
        ),
      new Prisma.Decimal(0),
    );

  const depositTotal =
    rentalItems.reduce(
      (
        total,
        rentalItem,
      ) =>
        total.add(
          rentalItem.depositAmount,
        ),
      new Prisma.Decimal(0),
    );

  const totalAmount =
    subtotal.add(depositTotal);

  const result =
    await prisma.$transaction(
      async (transaction) => {
        for (
          const rentalItem
          of rentalItems
        ) {
          const inventoryUpdate =
            await transaction.gearItem.updateMany({
              where: {
                id:
                  rentalItem
                    .gearItem.id,

                status:
                  "AVAILABLE",

                availableStock:
                  rentalItem
                    .gearItem
                    .availableStock,
              },

              data: {
                availableStock: {
                  decrement:
                    rentalItem.quantity,
                },

                ...(rentalItem
                  .gearItem
                  .availableStock ===
                  rentalItem.quantity && {
                  status:
                    "UNAVAILABLE",
                }),
              },
            });

          if (
            inventoryUpdate.count !== 1
          ) {
            throw new AppError(
              409,
              `Stock changed for ${rentalItem.gearItem.name}. Please try again.`,
              {
                gearItemId:
                  rentalItem
                    .gearItem.id,
              },
            );
          }
        }

        const rentalOrder =
          await transaction.rentalOrder.create({
            data: {
              customerId,
              providerId,

              startDate,
              endDate,

              status: "PLACED",

              subtotal,
              depositTotal,
              totalAmount,

              notes:
                payload.notes?.trim(),

              items: {
                create:
                  rentalItems.map(
                    (
                      rentalItem,
                    ) => ({
                      gearItemId:
                        rentalItem
                          .gearItem.id,

                      quantity:
                        rentalItem.quantity,

                      pricePerDay:
                        rentalItem.pricePerDay,

                      rentalDays:
                        rentalItem.rentalDays,

                      subtotal:
                        rentalItem.subtotal,

                      depositAmount:
                        rentalItem.depositAmount,
                    }),
                  ),
              },
            },

            include:
              rentalInclude,
          });

        return rentalOrder;
      },
    );

  return result;
};

const getCustomerRentalsFromDB =
  async (
    customerId: string,
    query: IRentalQuery,
  ) => {
    const where:
      Prisma.RentalOrderWhereInput = {
      customerId,

      ...(query.status && {
        status: query.status,
      }),
    };

    const skip =
      (query.page - 1) *
      query.limit;

    const [rentalOrders, total] =
      await prisma.$transaction([
        prisma.rentalOrder.findMany({
          where,

          skip,

          take: query.limit,

          orderBy: {
            createdAt:
              query.sortOrder,
          },

          include:
            rentalInclude,
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

      data: rentalOrders,
    };
  };

const getProviderRentalsFromDB =
  async (
    providerId: string,
    query: IRentalQuery,
  ) => {
    const where:
      Prisma.RentalOrderWhereInput = {
      providerId,

      ...(query.status && {
        status: query.status,
      }),
    };

    const skip =
      (query.page - 1) *
      query.limit;

    const [rentalOrders, total] =
      await prisma.$transaction([
        prisma.rentalOrder.findMany({
          where,

          skip,

          take: query.limit,

          orderBy: {
            createdAt:
              query.sortOrder,
          },

          include:
            rentalInclude,
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

      data: rentalOrders,
    };
  };

const getRentalByIdFromDB =
  async (
    rentalId: string,
    userId: string,
    userRole: Role,
  ) => {
    const rentalOrder =
      await prisma.rentalOrder.findUnique({
        where: {
          id: rentalId,
        },

        include:
          rentalInclude,
      });

    if (!rentalOrder) {
      throw new AppError(
        404,
        "Rental order not found",
      );
    }

    const hasAccess =
      userRole === "ADMIN" ||
      (
        userRole === "CUSTOMER" &&
        rentalOrder.customerId ===
          userId
      ) ||
      (
        userRole === "PROVIDER" &&
        rentalOrder.providerId ===
          userId
      );

    if (!hasAccess) {
      throw new AppError(
        403,
        "You do not have permission to view this rental order",
      );
    }

    return rentalOrder;
  };

const restoreRentalStock = async (
  transaction:
    Prisma.TransactionClient,
  rentalItems: Array<{
    quantity: number;
    gearItem: {
      id: string;
      status:
        | "AVAILABLE"
        | "UNAVAILABLE"
        | "ARCHIVED";
    };
  }>,
): Promise<void> => {
  for (
    const rentalItem
    of rentalItems
  ) {
    await transaction.gearItem.update({
      where: {
        id:
          rentalItem.gearItem.id,
      },

      data: {
        availableStock: {
          increment:
            rentalItem.quantity,
        },

        ...(rentalItem.gearItem
          .status !==
          "ARCHIVED" && {
          status:
            "AVAILABLE",
        }),
      },
    });
  }
};

const cancelRentalFromDB =
  async (
    rentalId: string,
    customerId: string,
  ) => {
    const result =
      await prisma.$transaction(
        async (transaction) => {
          const rentalOrder =
            await transaction.rentalOrder.findUnique({
              where: {
                id: rentalId,
              },

              include: {
                items: {
                  include: {
                    gearItem: {
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            });

          if (!rentalOrder) {
            throw new AppError(
              404,
              "Rental order not found",
            );
          }

          if (
            rentalOrder.customerId !==
            customerId
          ) {
            throw new AppError(
              403,
              "You can only cancel your own rental orders",
            );
          }

          if (
            rentalOrder.status !==
            "PLACED"
          ) {
            throw new AppError(
              409,
              "Only a placed rental order can be cancelled",
              {
                currentStatus:
                  rentalOrder.status,
              },
            );
          }

          await restoreRentalStock(
            transaction,
            rentalOrder.items,
          );

          return transaction.rentalOrder.update({
            where: {
              id: rentalId,
            },

            data: {
              status:
                "CANCELLED",
            },

            include:
              rentalInclude,
          });
        },
      );

    return result;
  };

const updateRentalStatusIntoDB =
  async (
    rentalId: string,
    providerId: string,
    payload:
      IUpdateRentalStatusPayload,
  ) => {
    const allowedTransition:
      Partial<
        Record<
          | "PLACED"
          | "CONFIRMED"
          | "PAID"
          | "PICKED_UP"
          | "RETURNED"
          | "CANCELLED",
          string
        >
      > = {
      PLACED: "CONFIRMED",
      PAID: "PICKED_UP",
      PICKED_UP: "RETURNED",
    };

    const result =
      await prisma.$transaction(
        async (transaction) => {
          const rentalOrder =
            await transaction.rentalOrder.findUnique({
              where: {
                id: rentalId,
              },

              include: {
                items: {
                  include: {
                    gearItem: {
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            });

          if (!rentalOrder) {
            throw new AppError(
              404,
              "Rental order not found",
            );
          }

          if (
            rentalOrder.providerId !==
            providerId
          ) {
            throw new AppError(
              403,
              "You can only update rental orders for your own gear",
            );
          }

          const expectedStatus =
            allowedTransition[
              rentalOrder.status
            ];

          if (
            expectedStatus !==
            payload.status
          ) {
            throw new AppError(
              409,
              `Rental status cannot change from ${rentalOrder.status} to ${payload.status}`,
              {
                currentStatus:
                  rentalOrder.status,

                requestedStatus:
                  payload.status,

                allowedNextStatus:
                  expectedStatus ??
                  null,
              },
            );
          }

          if (
            payload.status ===
            "RETURNED"
          ) {
            await restoreRentalStock(
              transaction,
              rentalOrder.items,
            );
          }

          return transaction.rentalOrder.update({
            where: {
              id: rentalId,
            },

            data: {
              status:
                payload.status,
            },

            include:
              rentalInclude,
          });
        },
      );

    return result;
  };

export const rentalService = {
  createRentalIntoDB,
  getCustomerRentalsFromDB,
  getProviderRentalsFromDB,
  getRentalByIdFromDB,
  cancelRentalFromDB,
  updateRentalStatusIntoDB,
};