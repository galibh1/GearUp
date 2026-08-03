import type {
  Request,
  Response,
} from "express";
import type Stripe from "stripe";

import config from "../../config";
import AppError from "../../errors/AppError";
import { getStripeClient } from "../../lib/stripe";
import catchAsync from "../../utils/catchAsync";
import type {
  IConfirmPaymentPayload,
  ICreatePaymentPayload,
  IPaymentQuery,
} from "./payment.interface";
import { paymentService } from "./payment.service";

type ValidatedRequestData<
  TBody = Record<string, never>,
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

type PaymentIdParams = {
  id: string;
};

const createPaymentSession = catchAsync(
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
      req.validatedData as ValidatedRequestData<ICreatePaymentPayload>;

    const result =
      await paymentService.createPaymentSessionIntoStripe(
        req.user.id,
        validatedData.body,
      );

    res.status(201).json({
      success: true,
      message:
        "Stripe Checkout Session created successfully",
      data: result,
    });
  },
);

const confirmPayment = catchAsync(
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
      req.validatedData as ValidatedRequestData<IConfirmPaymentPayload>;

    const result =
      await paymentService.confirmPaymentFromStripe(
        req.user.id,
        validatedData.body,
      );

    res.status(200).json({
      success: true,
      message:
        "Payment verified and confirmed successfully",
      data: result,
    });
  },
);

const getMyPayments = catchAsync(
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
        Record<string, never>,
        IPaymentQuery
      >;

    const result =
      await paymentService.getMyPaymentsFromDB(
        req.user.id,
        validatedData.query,
      );

    res.status(200).json({
      success: true,
      message:
        "Payment history retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getPaymentById = catchAsync(
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
        PaymentIdParams
      >;

    const result =
      await paymentService.getPaymentByIdFromDB(
        validatedData.params.id,
        req.user.id,
      );

    res.status(200).json({
      success: true,
      message:
        "Payment details retrieved successfully",
      data: result,
    });
  },
);

const handleStripeWebhook = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    if (!config.stripe_webhook_secret) {
      throw new AppError(
        500,
        "Stripe webhook secret is not configured",
        {
          environmentVariable:
            "STRIPE_WEBHOOK_SECRET",
        },
      );
    }

    const stripeSignature =
      req.headers["stripe-signature"];

    if (
      !stripeSignature ||
      Array.isArray(stripeSignature)
    ) {
      throw new AppError(
        400,
        "Stripe signature header is missing",
      );
    }

    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(
        400,
        "Stripe webhook requires the raw request body",
      );
    }

    const stripe =
      getStripeClient();

    let event: Stripe.Event;

    try {
      event =
        stripe.webhooks.constructEvent(
          req.body,
          stripeSignature,
          config.stripe_webhook_secret,
        );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Stripe webhook signature verification failed";

      throw new AppError(
        400,
        "Invalid Stripe webhook signature",
        {
          reason: errorMessage,
        },
      );
    }

    const result =
      await paymentService.processStripeWebhookEvent(
        event,
      );

    res.status(200).json({
      success: true,
      message: result.handled
        ? "Stripe webhook processed successfully"
        : "Stripe webhook received successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getPaymentById,
  handleStripeWebhook,
};