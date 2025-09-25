import Stripe from 'stripe';
import { config } from '../config.js';

export function getPayments() {
  if (config.payments.provider === 'stripe' && config.payments.stripeSecretKey) {
    const stripe = new Stripe(config.payments.stripeSecretKey, { apiVersion: '2024-06-20' });
    return createStripeProvider(stripe);
  }
  // Fallback fake provider for local dev
  return createFakeProvider();
}

function createStripeProvider(stripe) {
  return {
    async createCheckout({ userEmail, packId }) {
      const qty = Number(packId);
      const credits = [5, 30, 90].includes(qty) ? qty : 5;
      const price = config.payments.priceCents; // cents per credit
      const amount = credits * price;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: 'http://localhost:3000/pay/success',
        cancel_url: 'http://localhost:3000/pay/cancel',
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: { name: `${credits} créditos DarkChannelAgent` },
              unit_amount: amount
            },
            quantity: 1
          }
        ],
        metadata: { userEmail, credits }
      });
      return { checkoutUrl: session.url };
    },
    async parseWebhook(req) {
      // Caller should pass rawBody if verifying signature; omitted here for simplicity
      return { ok: true, type: req.body?.type || 'payment_intent.succeeded', data: req.body };
    }
  };
}

function createFakeProvider() {
  return {
    async createCheckout({ userEmail, packId }) {
      const credits = [5, 30, 90].includes(Number(packId)) ? Number(packId) : 5;
      const url = `https://example.local/checkout?email=${encodeURIComponent(userEmail)}&credits=${credits}`;
      return { checkoutUrl: url };
    },
    async parseWebhook(req) {
      return { ok: true, type: 'payment.succeeded', data: req.body };
    }
  };
}

