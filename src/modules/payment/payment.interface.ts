import type {
  PaymentStatus,
} from "../../../generated/prisma/enums";

export interface ICreatePaymentPayload {
  rentalOrderId: string;
}

export interface IConfirmPaymentPayload {
  stripeSessionId: string;
}

export interface IPaymentQuery {
  status?: PaymentStatus;

  page: number;
  limit: number;

  sortOrder: "asc" | "desc";
}

export interface IPaymentPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IStripeCheckoutMetadata {
  paymentId: string;
  rentalOrderId: string;
  customerId: string;
}