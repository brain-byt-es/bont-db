"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { createHash } from "crypto"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { updateSubscriptionSeatCount } from "@/lib/stripe-billing"

export async function acceptInviteAction(token: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return { error: "You must be logged in to accept an invite." }
  }

  const userId = session.user.id
  const tokenHash = createHash("sha256").update(token).digest("hex")

  // 1. Verify Token
  const invite = await prisma.organizationInvite.findUnique({
    where: { tokenHash },
    include: { organization: true }
  })

  if (!invite) {
    return { error: "Invalid invite link." }
  }

  if (new Date() > invite.expiresAt) {
    return { error: "This invite has expired." }
  }

  if (invite.acceptedAt) {
    return { error: "This invite has already been used." }
  }

  // 2. Accept Logic
  // Check if user is already a member (idempotency)
  const existingMembership = await prisma.organizationMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invite.organizationId,
        userId: userId
      }
    }
  })

  const cookieStore = await cookies()
  const setOrgCookie = () => {
      cookieStore.set("injexpro_org_id", invite.organizationId, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
  }

  if (existingMembership) {
    // Already member? Just clean up invite and redirect
    // We try/catch the delete in case it was already deleted, but here we assume it exists
    try {
        await prisma.organizationInvite.delete({ where: { id: invite.id } })
    } catch { 
        // ignore 
    }
    
    setOrgCookie()
    redirect("/dashboard")
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create Membership
      await tx.organizationMembership.create({
        data: {
          organizationId: invite.organizationId,
          userId: userId,
          role: invite.role,
          status: "ACTIVE"
        }
      })

      // Update Invite (Log it as accepted, or delete it. Schema has acceptedAt so we update)
      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() }
      })
    })

    // Update Billing (Async, don't block heavily but ensure triggered)
    await updateSubscriptionSeatCount(invite.organizationId)
    
    setOrgCookie()
  } catch (error) {
    console.error("Failed to accept invite", error)
    return { error: "Failed to process acceptance." }
  }

  redirect("/dashboard")
}
