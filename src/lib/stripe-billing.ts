import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { MembershipRole, SubscriptionStatus, MembershipStatus, Plan } from "@/generated/client/enums"
import Stripe from "stripe"

/**
 * Calculates the number of billable seats for an organization.
 * Billable roles: OWNER, CLINIC_ADMIN, PROVIDER, ASSISTANT.
 * Excludes: READONLY, INVITED (unless you want to bill for pending invites, usually we don't).
 */
export async function calculateBillableSeats(organizationId: string): Promise<number> {
  const count = await prisma.organizationMembership.count({
    where: {
      organizationId,
      status: MembershipStatus.ACTIVE, // Only bill for active members
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
  // Minimum 1 seat always
  return Math.max(1, count)
}

/**
 * Updates the Stripe subscription quantity based on current billable seats.
 * Should be called whenever a member is added, removed, or changes role.
 */
export async function updateSubscriptionSeatCount(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { 
        plan: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true
      }
    })

    if (!org || !org.stripeSubscriptionId) {
      return // No subscription to update
    }

    // Enterprise is managed via Sales/Invoices manually
    if (org.plan === Plan.ENTERPRISE) {
        return
    }

    // Only update active subscriptions (or past_due/trialing)
    const updateableStatuses: SubscriptionStatus[] = [
        SubscriptionStatus.ACTIVE, 
        SubscriptionStatus.TRIALING, 
        SubscriptionStatus.PAST_DUE
    ]

    if (!updateableStatuses.includes(org.subscriptionStatus)) {
        return
    }

    // Resolve target quantity
    // Option A: PRO is Flat Fee (1 unit covers up to limit)
    const targetQuantity = org.plan === Plan.PRO ? 1 : await calculateBillableSeats(organizationId)
    
    // Fetch subscription to get the item ID
    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId) as Stripe.Subscription
    const subscriptionItemId = subscription.items.data[0]?.id

    if (!subscriptionItemId) {
        console.error(`[Stripe Billing] No subscription item found for org ${organizationId}`)
        return
    }

    // Check if update is needed
    if (subscription.items.data[0].quantity === targetQuantity) {
        return // No change
    }

    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      items: [{
        id: subscriptionItemId,
        quantity: targetQuantity
      }],
      proration_behavior: 'always_invoice'
    })

    console.log(`[Stripe Billing] Updated Stripe quantity for org ${organizationId} to ${targetQuantity} (Plan: ${org.plan})`)

  } catch (error) {
    console.error(`[Stripe Billing] Failed to update Stripe for org ${organizationId}:`, error)
  }
}
