import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { MembershipRole, SubscriptionStatus, MembershipStatus } from "@/generated/client/enums"
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
        stripeSubscriptionId: true,
        subscriptionStatus: true
      }
    })

    if (!org || !org.stripeSubscriptionId) {
      return // No subscription to update
    }

    // Only update active subscriptions (or past_due/trialing)
    // If canceled/unpaid, we shouldn't bump quantity (or maybe we can't)
    const updateableStatuses: SubscriptionStatus[] = [
        SubscriptionStatus.ACTIVE, 
        SubscriptionStatus.TRIALING, 
        SubscriptionStatus.PAST_DUE
    ]

    if (!updateableStatuses.includes(org.subscriptionStatus)) {
        return
    }

    const seats = await calculateBillableSeats(organizationId)
    
    // Fetch subscription to get the item ID
    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId) as Stripe.Subscription
    const subscriptionItemId = subscription.items.data[0]?.id

    if (!subscriptionItemId) {
        console.error(`[Stripe Billing] No subscription item found for org ${organizationId}`)
        return
    }

    // Check if update is needed
    if (subscription.items.data[0].quantity === seats) {
        return // No change
    }

    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      items: [{
        id: subscriptionItemId,
        quantity: seats
      }],
      proration_behavior: 'always_invoice' // Immediately charge/credit for seat changes
    })

    console.log(`[Stripe Billing] Updated seat count for org ${organizationId} to ${seats}`)

  } catch (error) {
    console.error(`[Stripe Billing] Failed to update seat count for org ${organizationId}:`, error)
    // We don't throw here to avoid breaking the user flow (e.g. "Invite Accepted" shouldn't fail if Stripe is down)
    // Ideally, we'd have a background job to reconcile this.
  }
}
