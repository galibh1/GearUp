import Stripe from "stripe";

import config from "../config";
import AppError from "../errors/AppError";

let stripeClient: Stripe | null = null;

const getStripeClient = (): Stripe => {
  if (!config.stripe_secret_key) {
    throw new AppError(
      500,
      "Stripe payment service is not configured",
      {
        environmentVariable: "STRIPE_SECRET_KEY",
      },
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(
      config.stripe_secret_key,
    );
  }

  return stripeClient;
};

export {
  getStripeClient,
};