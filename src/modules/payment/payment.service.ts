import { Prisma } from "../../../generated/prisma/client";
import type Stripe from "stripe";

import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import { getStripeClient } from "../../lib/stripe";
import type {
  IConfirmPaymentPayload,
  ICreatePaymentPayload,
  IPaymentPaginationMeta,
  IPaymentQuery,
} from "./payment.interface";

const paymentInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },

  rentalOrder: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      subtotal: true,
      depositTotal: true,
      totalAmount: true,
      createdAt: true,

      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        select: {
          id: true,
          quantity: true,
          pricePerDay: true,
          rentalDays: true,
          subtotal: true,
          depositAmount: true,

          gearItem: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrls: true,
            },
          },
        },
      },
    },
  },
};

const createPaginationMeta = (
  query: IPaymentQuery,
  total: number,
): IPaymentPaginationMeta => {
  return {
    page: query.page,
    limit: query.limit,
    total,

    totalPages:
      total === 0
        ? 0
        : Math.ceil(total / query.limit),
  };
};

const convertAmountToMinorUnit = (
  amount: Prisma.Decimal,
): number => {
  const amountInMinorUnit = Number(
    new Prisma.Decimal(amount)
      .mul(100)
      .toFixed(0),
  );

  if (
    !Number.isSafeInteger(amountInMinorUnit) ||
    amountInMinorUnit <= 0
  ) {
    throw new AppError(
      500,
      "Invalid payment amount",
      {
        amount: amount.toString(),
      },
    );
  }

  return amountInMinorUnit;
};

const createSuccessUrl = (): string => {
  const separator =
    config.payment_success_url.includes("?")
      ? "&"
      : "?";

  return `${config.payment_success_url}${separator}session_id={CHECKOUT_SESSION_ID}`;
};

const getPaymentIntentId = (
  session: Stripe.Checkout.Session,
): string | null => {
  if (
    typeof session.payment_intent ===
    "string"
  ) {
    return session.payment_intent;
  }

  if (
    session.payment_intent &&
    typeof session.payment_intent ===
      "object"
  ) {
    return session.payment_intent.id;
  }

  return null;
};

const getPaymentMethod = (
  session: Stripe.Checkout.Session,
): string | null => {
  if (
    session.payment_intent &&
    typeof session.payment_intent ===
      "object"
  ) {
    return (
      session.payment_intent
        .payment_method_types[0] ??
      null
    );
  }

  return (
    session.payment_method_types[0] ??
    null
  );
};

const findPaymentFromStripeSession = async (
  session: Stripe.Checkout.Session,
) => {
  const metadataPaymentId =
    session.metadata?.paymentId;

  const payment =
    await prisma.payment.findFirst({
      where: metadataPaymentId
        ? {
            OR: [
              {
                id: metadataPaymentId,
              },
              {
                stripeSessionId:
                  session.id,
              },
            ],
          }
        : {
            stripeSessionId:
              session.id,
          },

      include: paymentInclude,
    });

  if (!payment) {
    throw new AppError(
      404,
      "Payment record not found for this Stripe session",
      {
        stripeSessionId:
          session.id,
      },
    );
  }

  return payment;
};

const completePaymentFromStripeSession =
  async (
    session: Stripe.Checkout.Session,
    expectedCustomerId?: string,
  ) => {
    const payment =
      await findPaymentFromStripeSession(
        session,
      );

    if (
      expectedCustomerId &&
      payment.customerId !==
        expectedCustomerId
    ) {
      throw new AppError(
        403,
        "You do not have permission to confirm this payment",
      );
    }

    if (
      session.metadata?.rentalOrderId &&
      session.metadata.rentalOrderId !==
        payment.rentalOrderId
    ) {
      throw new AppError(
        409,
        "Stripe payment metadata does not match the rental order",
      );
    }

    if (
      session.payment_status !==
      "paid"
    ) {
      throw new AppError(
        409,
        "Stripe payment has not been completed",
        {
          stripeSessionId:
            session.id,
          paymentStatus:
            session.payment_status,
          checkoutStatus:
            session.status,
        },
      );
    }

    const expectedAmount =
      convertAmountToMinorUnit(
        payment.amount,
      );

    if (
      session.amount_total === null ||
      session.amount_total !==
        expectedAmount
    ) {
      throw new AppError(
        409,
        "Stripe payment amount does not match the rental amount",
        {
          expectedAmount,
          receivedAmount:
            session.amount_total,
        },
      );
    }

    const stripeCurrency =
      session.currency?.toLowerCase();

    const localCurrency =
      payment.currency.toLowerCase();

    if (
      !stripeCurrency ||
      stripeCurrency !== localCurrency
    ) {
      throw new AppError(
        409,
        "Stripe payment currency does not match the rental currency",
        {
          expectedCurrency:
            localCurrency,
          receivedCurrency:
            stripeCurrency ?? null,
        },
      );
    }

    if (
      payment.rentalOrder.status !==
        "CONFIRMED" &&
      payment.rentalOrder.status !==
        "PAID"
    ) {
      throw new AppError(
        409,
        "This rental order cannot be marked as paid",
        {
          rentalStatus:
            payment.rentalOrder.status,
        },
      );
    }

    const paymentIntentId =
      getPaymentIntentId(session);

    const transactionId =
      paymentIntentId ??
      session.id;

    const paymentMethod =
      getPaymentMethod(session);

    const result =
      await prisma.$transaction(
        async (transaction) => {
          await transaction.payment.update({
            where: {
              id: payment.id,
            },

            data: {
              status: "COMPLETED",

              stripeSessionId:
                session.id,

              paymentIntentId,

              transactionId,

              paymentMethod,

              paidAt:
                payment.paidAt ??
                new Date(),

              failedAt: null,
              failureReason: null,
            },
          });

          if (
            payment.rentalOrder.status ===
            "CONFIRMED"
          ) {
            await transaction.rentalOrder.update({
              where: {
                id:
                  payment.rentalOrderId,
              },

              data: {
                status: "PAID",
              },
            });
          }

          return transaction.payment.findUnique({
            where: {
              id: payment.id,
            },

            include: paymentInclude,
          });
        },
      );

    if (!result) {
      throw new AppError(
        500,
        "Unable to retrieve the completed payment",
      );
    }

    return result;
  };

const markPaymentAsFailedFromSession =
  async (
    session: Stripe.Checkout.Session,
    reason: string,
  ) => {
    const payment =
      await findPaymentFromStripeSession(
        session,
      );

    if (
      payment.status ===
      "COMPLETED"
    ) {
      return payment;
    }

    return prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: "FAILED",
        failedAt: new Date(),
        failureReason: reason,
      },

      include: paymentInclude,
    });
  };

const createPaymentSessionIntoStripe =
  async (
    customerId: string,
    payload: ICreatePaymentPayload,
  ) => {
    const stripe =
      getStripeClient();

    const rentalOrder =
      await prisma.rentalOrder.findUnique({
        where: {
          id: payload.rentalOrderId,
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
            },
          },

          items: {
            select: {
              quantity: true,

              gearItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          payments: {
            where: {
              status: "COMPLETED",
            },

            select: {
              id: true,
            },

            take: 1,
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
        "You can only pay for your own rental orders",
      );
    }

    if (
      rentalOrder.status === "PAID" ||
      rentalOrder.payments.length > 0
    ) {
      throw new AppError(
        409,
        "This rental order has already been paid",
      );
    }

    if (
      rentalOrder.status !==
      "CONFIRMED"
    ) {
      throw new AppError(
        409,
        "Only a confirmed rental order can be paid",
        {
          currentStatus:
            rentalOrder.status,
        },
      );
    }

    const currency =
      config.stripe_currency.toLowerCase();

    const amountInMinorUnit =
      convertAmountToMinorUnit(
        rentalOrder.totalAmount,
      );

    const payment =
      await prisma.payment.create({
        data: {
          rentalOrderId:
            rentalOrder.id,

          customerId,

          amount:
            rentalOrder.totalAmount,

          currency,

          paymentProvider:
            "STRIPE",

          status:
            "PENDING",

          metadata: {
            rentalOrderId:
              rentalOrder.id,

            providerId:
              rentalOrder.providerId,

            createdFrom:
              "CHECKOUT_SESSION",
          },
        },
      });

    try {
      const session =
        await stripe.checkout.sessions.create(
          {
            mode: "payment",

            payment_method_types: [
              "card",
            ],

            customer_email:
              rentalOrder.customer.email,

            client_reference_id:
              rentalOrder.id,

            success_url:
              createSuccessUrl(),

            cancel_url:
              config.payment_cancel_url,

            line_items: [
              {
                quantity: 1,

                price_data: {
                  currency,

                  unit_amount:
                    amountInMinorUnit,

                  product_data: {
                    name:
                      "GearUp Rental Payment",

                    description:
                      `Rental ${rentalOrder.id} from ` +
                      `${rentalOrder.startDate.toISOString()} ` +
                      `to ${rentalOrder.endDate.toISOString()}`,
                  },
                },
              },
            ],

            metadata: {
              paymentId:
                payment.id,

              rentalOrderId:
                rentalOrder.id,

              customerId,
            },

            payment_intent_data: {
              metadata: {
                paymentId:
                  payment.id,

                rentalOrderId:
                  rentalOrder.id,

                customerId,
              },
            },
          },

          {
            idempotencyKey:
              `gearup-checkout-${payment.id}`,
          },
        );

      const updatedPayment =
        await prisma.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            stripeSessionId:
              session.id,

            metadata: {
              rentalOrderId:
                rentalOrder.id,

              providerId:
                rentalOrder.providerId,

              stripeSessionId:
                session.id,

              checkoutStatus:
                session.status,

              createdFrom:
                "CHECKOUT_SESSION",
            },
          },

          include: paymentInclude,
        });

      return {
        payment:
          updatedPayment,

        checkoutSession: {
          id: session.id,
          url: session.url,

          status:
            session.status,

          paymentStatus:
            session.payment_status,

          expiresAt:
            new Date(
              session.expires_at *
                1000,
            ),
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to create Stripe Checkout Session";

      await prisma.payment
        .update({
          where: {
            id: payment.id,
          },

          data: {
            status: "FAILED",

            failedAt:
              new Date(),

            failureReason:
              errorMessage,
          },
        })
        .catch(() => undefined);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        502,
        "Unable to create Stripe Checkout Session",
        {
          reason: errorMessage,
        },
      );
    }
  };

const confirmPaymentFromStripe =
  async (
    customerId: string,
    payload: IConfirmPaymentPayload,
  ) => {
    const stripe =
      getStripeClient();

    let session:
      Stripe.Checkout.Session;

    try {
      session =
        await stripe.checkout.sessions.retrieve(
          payload.stripeSessionId,
          {
            expand: [
              "payment_intent",
            ],
          },
        );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to retrieve Stripe Checkout Session";

      throw new AppError(
        502,
        "Unable to verify payment with Stripe",
        {
          reason: errorMessage,
        },
      );
    }

    return completePaymentFromStripeSession(
      session,
      customerId,
    );
  };

const getMyPaymentsFromDB = async (
  customerId: string,
  query: IPaymentQuery,
) => {
  const where:
    Prisma.PaymentWhereInput = {
    customerId,

    ...(query.status && {
      status: query.status,
    }),
  };

  const skip =
    (query.page - 1) *
    query.limit;

  const [payments, total] =
    await prisma.$transaction([
      prisma.payment.findMany({
        where,

        skip,

        take: query.limit,

        orderBy: {
          createdAt:
            query.sortOrder,
        },

        include: paymentInclude,
      }),

      prisma.payment.count({
        where,
      }),
    ]);

  return {
    meta:
      createPaginationMeta(
        query,
        total,
      ),

    data: payments,
  };
};

const getPaymentByIdFromDB = async (
  paymentId: string,
  customerId: string,
) => {
  const payment =
    await prisma.payment.findFirst({
      where: {
        id: paymentId,
        customerId,
      },

      include: paymentInclude,
    });

  if (!payment) {
    throw new AppError(
      404,
      "Payment not found",
    );
  }

  return payment;
};

const processStripeWebhookEvent =
  async (
    event: Stripe.Event,
  ) => {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        if (
          session.payment_status !==
          "paid"
        ) {
          return {
            handled: false,
            eventType:
              event.type,
            reason:
              "Checkout completed but payment is not yet paid",
          };
        }

        const payment =
          await completePaymentFromStripeSession(
            session,
          );

        return {
          handled: true,
          eventType:
            event.type,
          payment,
        };
      }

      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const payment =
          await completePaymentFromStripeSession(
            session,
          );

        return {
          handled: true,
          eventType:
            event.type,
          payment,
        };
      }

      case "checkout.session.async_payment_failed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const payment =
          await markPaymentAsFailedFromSession(
            session,
            "Stripe asynchronous payment failed",
          );

        return {
          handled: true,
          eventType:
            event.type,
          payment,
        };
      }

      case "checkout.session.expired": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const payment =
          await markPaymentAsFailedFromSession(
            session,
            "Stripe Checkout Session expired before payment",
          );

        return {
          handled: true,
          eventType:
            event.type,
          payment,
        };
      }

      default:
        return {
          handled: false,
          eventType:
            event.type,
          reason:
            "Event type is not used by GearUp",
        };
    }
  };

export const paymentService = {
  createPaymentSessionIntoStripe,
  confirmPaymentFromStripe,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB,
  processStripeWebhookEvent,
};