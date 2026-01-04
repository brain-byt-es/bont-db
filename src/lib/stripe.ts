import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing. Stripe integration will not work.')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
  appInfo: {
    name: 'InjexPro Docs',
    version: '0.1.0',
  },
})
