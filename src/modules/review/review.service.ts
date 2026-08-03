import type {
  Prisma,
} from "../../../generated/prisma/client";

import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type {
  ICreateReviewPayload,
  IReviewPaginationMeta,
  IReviewQuery,
  IUpdateReviewPayload,
} from "./review.interface";

const reviewInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },

  gearItem: {
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      imageUrls: true,

      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },

  rentalOrder: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
  },
} satisfies Prisma.ReviewInclude;

const createPaginationMeta = (
  query: IReviewQuery,
  total: number,
): IReviewPaginationMeta => {
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

const createReviewIntoDB = async (
  customerId: string,
  payload: ICreateReviewPayload,
) => {
  const rentalOrder =
    await prisma.rentalOrder.findFirst({
      where: {
        id: payload.rentalOrderId,
        customerId,
      },

      include: {
        items: {
          where: {
            gearItemId:
              payload.gearItemId,
          },

          select: {
            id: true,
            gearItemId: true,
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
    rentalOrder.status !==
    "RETURNED"
  ) {
    throw new AppError(
      409,
      "A review can only be submitted after the rental has been returned",
      {
        currentStatus:
          rentalOrder.status,
        requiredStatus:
          "RETURNED",
      },
    );
  }

  if (
    rentalOrder.items.length === 0
  ) {
    throw new AppError(
      409,
      "The selected gear item was not included in this rental order",
      {
        rentalOrderId:
          rentalOrder.id,
        gearItemId:
          payload.gearItemId,
      },
    );
  }

  const existingReview =
    await prisma.review.findFirst({
      where: {
        customerId,
        rentalOrderId:
          payload.rentalOrderId,
        gearItemId:
          payload.gearItemId,
      },

      select: {
        id: true,
      },
    });

  if (existingReview) {
    throw new AppError(
      409,
      "You have already reviewed this gear item for this rental order",
      {
        reviewId:
          existingReview.id,
      },
    );
  }

  return prisma.review.create({
    data: {
      customerId,

      rentalOrderId:
        payload.rentalOrderId,

      gearItemId:
        payload.gearItemId,

      rating:
        payload.rating,

      comment:
        payload.comment,
    },

    include: reviewInclude,
  });
};

const getGearReviewsFromDB =
  async (
    gearItemId: string,
    query: IReviewQuery,
  ) => {
    const gearItem =
      await prisma.gearItem.findUnique({
        where: {
          id: gearItemId,
        },

        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

    if (!gearItem) {
      throw new AppError(
        404,
        "Gear item not found",
      );
    }

    const where:
      Prisma.ReviewWhereInput = {
      gearItemId,
    };

    const skip =
      (query.page - 1) *
      query.limit;

    const [
      reviews,
      total,
      ratingSummary,
    ] = await prisma.$transaction([
      prisma.review.findMany({
        where,

        skip,

        take: query.limit,

        orderBy: {
          createdAt:
            query.sortOrder,
        },

        include: reviewInclude,
      }),

      prisma.review.count({
        where,
      }),

      prisma.review.aggregate({
        where,

        _avg: {
          rating: true,
        },

        _count: {
          rating: true,
        },
      }),
    ]);

    const averageRating =
      ratingSummary._avg.rating !==
      null
        ? Number(
            ratingSummary._avg.rating.toFixed(
              2,
            ),
          )
        : 0;

    return {
      gearItem,

      summary: {
        averageRating,

        totalReviews:
          ratingSummary._count.rating,
      },

      meta:
        createPaginationMeta(
          query,
          total,
        ),

      data: reviews,
    };
  };

const getReviewByIdFromDB =
  async (reviewId: string) => {
    const review =
      await prisma.review.findUnique({
        where: {
          id: reviewId,
        },

        include: reviewInclude,
      });

    if (!review) {
      throw new AppError(
        404,
        "Review not found",
      );
    }

    return review;
  };

const updateReviewIntoDB =
  async (
    reviewId: string,
    customerId: string,
    payload: IUpdateReviewPayload,
  ) => {
    const review =
      await prisma.review.findFirst({
        where: {
          id: reviewId,
          customerId,
        },

        select: {
          id: true,
        },
      });

    if (!review) {
      throw new AppError(
        404,
        "Review not found or you do not have permission to update it",
      );
    }

    return prisma.review.update({
      where: {
        id: review.id,
      },

      data: {
        ...(payload.rating !==
          undefined && {
          rating:
            payload.rating,
        }),

        ...(payload.comment !==
          undefined && {
          comment:
            payload.comment,
        }),
      },

      include: reviewInclude,
    });
  };

const deleteReviewFromDB =
  async (
    reviewId: string,
    customerId: string,
  ) => {
    const review =
      await prisma.review.findFirst({
        where: {
          id: reviewId,
          customerId,
        },

        select: {
          id: true,
        },
      });

    if (!review) {
      throw new AppError(
        404,
        "Review not found or you do not have permission to delete it",
      );
    }

    return prisma.review.delete({
      where: {
        id: review.id,
      },

      include: reviewInclude,
    });
  };

export const reviewService = {
  createReviewIntoDB,
  getGearReviewsFromDB,
  getReviewByIdFromDB,
  updateReviewIntoDB,
  deleteReviewFromDB,
};