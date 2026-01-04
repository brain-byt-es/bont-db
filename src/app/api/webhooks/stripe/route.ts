import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { revalidatePath } from "next/cache"

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

  // 1. Handle Successful Checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const organizationId = session.metadata?.organizationId
    const customerId = session.customer as string

    if (organizationId) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          plan: "PRO",
          billingExternalId: customerId,
        },
      })
      console.log(`Organization ${organizationId} upgraded to PRO`)
      revalidatePath('/', 'layout')
    }
  }

  // 2. Handle Subscription Changes
  if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription
      const organizationId = subscription.metadata?.organizationId
      
      if (organizationId) {
          const status = subscription.status
          if (status === 'active' || status === 'trialing') {
              await prisma.organization.update({
                  where: { id: organizationId },
                  data: { plan: 'PRO' }
              })
              revalidatePath('/', 'layout')
          }
      }
  }

  // 3. Handle Subscription Deletion (Canceled)
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    const organizationId = subscription.metadata?.organizationId

    if (organizationId) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          plan: "BASIC",
        },
      })
      console.log(`Organization ${organizationId} reverted to BASIC`)
      revalidatePath('/', 'layout')
    }
  }

  return new NextResponse(null, { status: 200 })
}