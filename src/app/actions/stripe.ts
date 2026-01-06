"use server"

import { stripe } from "@/lib/stripe"
import { getOrganizationContext } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { SubscriptionStatus } from "@/generated/client/enums"
import Stripe from "stripe"

/**
 * Creates a Stripe Checkout Session for upgrading to PRO.
 */
export async function createCheckoutSessionAction() {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("Unauthorized")

  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!priceId || priceId === "undefined") {
    throw new Error("Stripe Price ID is not configured. Please set STRIPE_PRO_PRICE_ID in your environment variables.")
  }

  const headerList = await headers()
  const origin = headerList.get("origin")

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: 1, // Flat fee for the organization
      },
    ],
    mode: "subscription",
    success_url: `${origin}/settings?tab=organization&success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/settings?tab=organization&canceled=true`,
    customer_email: ctx.membership.user.email,
    metadata: {
      organizationId: ctx.organizationId,
    },
    subscription_data: {
        metadata: {
            organizationId: ctx.organizationId,
        }
    }
  })

  if (!session.url) throw new Error("Failed to create checkout session")
  
  redirect(session.url)
}

/**
 * Creates a Stripe Customer Portal Session for managing subscriptions.
 */
export async function createCustomerPortalAction() {
    const ctx = await getOrganizationContext()
    if (!ctx) throw new Error("Unauthorized")

    const headerList = await headers()
    const origin = headerList.get("origin")

    // We need the Stripe Customer ID. In a real app, we'd store this in the Org model.
    // For now, we search by email or use billingExternalId if it exists.
    let customerId = ctx.organization.billingExternalId

    if (!customerId) {
        const customers = await stripe.customers.list({
            email: ctx.membership.user.email,
            limit: 1
        })
        if (customers.data.length > 0) {
            customerId = customers.data[0].id
        }
    }

    if (!customerId) {
        // If no customer exists yet, just send them back to settings
        redirect("/settings?tab=organization")
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/settings?tab=organization`,
    })

    redirect(session.url)
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case "active": return SubscriptionStatus.ACTIVE
      case "past_due": return SubscriptionStatus.PAST_DUE
      case "canceled": return SubscriptionStatus.CANCELED
      case "unpaid": return SubscriptionStatus.UNPAID
      case "incomplete": return SubscriptionStatus.INCOMPLETE
      case "incomplete_expired": return SubscriptionStatus.INCOMPLETE_EXPIRED
      case "trialing": return SubscriptionStatus.TRIALING
      case "paused": return SubscriptionStatus.PAUSED
      default: return SubscriptionStatus.INCOMPLETE
    }
}

/**
 * Manually syncs the session status to the database.
 * Useful when the webhook is slower than the user redirect.
 */
export async function syncStripeSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid' || session.status === 'complete') {
        const organizationId = session.metadata?.organizationId
        const customerId = session.customer as string
        const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription?.id

        // Fetch full subscription details to get period end
        let currentPeriodEnd: Date | null = null
        let status: SubscriptionStatus = SubscriptionStatus.ACTIVE

        if (subscriptionId) {
            // Retrieve subscription with correct types
            const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
            status = mapStripeStatus(subscription.status)
            
            // In this Stripe SDK version, current_period_end is on the individual items
            const periodEnd = subscription.items.data[0]?.current_period_end
            if (periodEnd) {
                currentPeriodEnd = new Date(periodEnd * 1000)
            }
        }

        if (organizationId) {
            await prisma.organization.update({
                where: { id: organizationId },
                data: {
                    plan: "PRO",
                    billingExternalId: customerId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    subscriptionStatus: status,
                    stripeCurrentPeriodEnd: currentPeriodEnd
                },
            })
            return true
        }
    }
  } catch (error) {
    console.error("Failed to sync Stripe session:", error)
  }
  return false
}
