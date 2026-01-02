"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { createHash } from "crypto"
import { redirect } from "next/navigation"

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

  if (existingMembership) {
    // Already member? Just clean up invite and redirect
    await prisma.organizationInvite.delete({ where: { id: invite.id } })
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
  } catch (error) {
    console.error("Failed to accept invite", error)
    return { error: "Failed to process acceptance." }
  }

  redirect("/dashboard")
}
