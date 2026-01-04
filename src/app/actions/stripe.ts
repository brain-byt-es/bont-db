"use server"

import { stripe } from "@/lib/stripe"
import { getOrganizationContext } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { MembershipRole } from "@/generated/client/enums"

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

  // Count active clinical seats (those who can write treatments)
  const clinicalSeatCount = await prisma.organizationMembership.count({
    where: {
      organizationId: ctx.organizationId,
      status: "ACTIVE",
      role: {
        in: [
          MembershipRole.OWNER,
          MembershipRole.CLINIC_ADMIN,
          MembershipRole.PROVIDER,
          MembershipRole.ASSISTANT
        ]
      }
    }
  })

  const headerList = await headers()
  const origin = headerList.get("origin")

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: Math.max(1, clinicalSeatCount),
      },
    ],
    mode: "subscription",
    success_url: `${origin}/settings?tab=organization&success=true`,
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
