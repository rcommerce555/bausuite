import Stripe from 'stripe';
import { env } from '@/lib/env';

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}
