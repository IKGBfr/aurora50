import Stripe from 'stripe';

// Ne pas lancer d'erreur au build time
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    })
  : null as any;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Vérification au runtime seulement
export function checkStripeConfig() {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY non configurée');
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET non configurée');
  }
}
