import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { revalidatePath } from "next/cache"
import { SubscriptionStatus } from "@/generated/client/enums"

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

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const signature = headerList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  try {
    // 1. Handle Successful Checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const organizationId = session.metadata?.organizationId
      const customerId = session.customer as string
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id

      if (organizationId) {
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            plan: "PRO",
            billingExternalId: customerId, // keep for backward compat
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          },
        })
        console.log(`[Stripe] Org ${organizationId} upgraded to PRO via Checkout`)
        revalidatePath('/', 'layout')
      }
    }

    // 2. Handle Subscription Changes (Renewals, Status Changes)
    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription
        const status = mapStripeStatus(subscription.status)
        const organizationId = subscription.metadata?.organizationId
        
        // If metadata is missing, try to find by stripeSubscriptionId
        let targetOrgId: string | undefined = organizationId
        if (!targetOrgId) {
            const org = await prisma.organization.findUnique({
                where: { stripeSubscriptionId: subscription.id },
                select: { id: true }
            })
            targetOrgId = org?.id
        }

        if (targetOrgId) {
            const isPro = status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING || status === SubscriptionStatus.PAST_DUE // Grace period keeps PRO
            
            const periodEnd = subscription.items.data[0]?.current_period_end

            await prisma.organization.update({
                where: { id: targetOrgId },
                data: { 
                    plan: isPro ? "PRO" : "BASIC",
                    subscriptionStatus: status,
                    stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined
                }
            })
            console.log(`[Stripe] Org ${targetOrgId} subscription updated: ${status} -> ${isPro ? 'PRO' : 'BASIC'}`)
            revalidatePath('/', 'layout')
        }
    }

    // 3. Handle Subscription Deletion (Canceled)
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      const organizationId = subscription.metadata?.organizationId

      let targetOrgId: string | undefined = organizationId
      if (!targetOrgId) {
          const org = await prisma.organization.findUnique({
              where: { stripeSubscriptionId: subscription.id },
              select: { id: true }
          })
          targetOrgId = org?.id
      }

      if (targetOrgId) {
        await prisma.organization.update({
          where: { id: targetOrgId },
          data: {
            plan: "BASIC",
            subscriptionStatus: SubscriptionStatus.CANCELED,
            stripeSubscriptionId: null // Optional: clear link so they can resubscribe cleanly
          },
        })
        console.log(`[Stripe] Org ${targetOrgId} subscription deleted (Canceled)`)
        revalidatePath('/', 'layout')
      }
    }

    // 4. Handle Payment Failures (Grace Period Trigger)
    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = invoice.parent?.subscription_details?.subscription
        const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id
        
        if (subscriptionId) {
            const org = await prisma.organization.findUnique({
                where: { stripeSubscriptionId: subscriptionId }
            })

            if (org) {
                await prisma.organization.update({
                    where: { id: org.id },
                    data: { subscriptionStatus: SubscriptionStatus.PAST_DUE }
                })
                console.log(`[Stripe] Org ${org.id} payment failed. Entering Grace Period (PAST_DUE).`)
                // TODO: Send email to Admin
            }
        }
    }

    return new NextResponse(null, { status: 200 })

  } catch (error) {
    console.error(`[Stripe Webhook Error]`, error)
    return new NextResponse(`Internal Server Error`, { status: 500 })
  }
}