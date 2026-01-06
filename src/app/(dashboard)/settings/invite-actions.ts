"use server"

import { revalidatePath } from "next/cache"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"
import { headers } from "next/headers"
import { MembershipRole, Plan } from "@/generated/client/enums"
import { PERMISSIONS, requirePermission, PLAN_SEAT_LIMITS, getEffectivePlan } from "@/lib/permissions"
import { updateSubscriptionSeatCount, calculateBillableSeats } from "@/lib/stripe-billing"
import { sendInviteEmail } from "@/lib/email"

export async function getTeamData() {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const [members, invites] = await Promise.all([
    prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, displayName: true, email: true, profilePhotoUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.organizationInvite.findMany({
      where: { organizationId, acceptedAt: null }, // Only pending
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Don't leak full user objects, just mapped view
  const mappedMembers = members.map(m => ({
    id: m.id,
    userId: m.userId,
    name: m.user.displayName || "Unknown",
    email: m.user.email,
    role: m.role,
    status: m.status,
    joinedAt: m.createdAt
  }))

  const mappedInvites = invites.map(i => ({
    id: i.id,
    email: i.email,
    role: i.role,
    expiresAt: i.expiresAt,
    createdAt: i.createdAt
  }))

  return { members: mappedMembers, invites: mappedInvites }
}

export async function createInviteAction(formData: FormData) {
  const ctx = await getOrganizationContext()
  if (!ctx) return { error: "No organization context" }
  const { organizationId, membership, organization } = ctx

  try {
    requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)
  } catch {
    return { error: "You do not have permission to invite members." }
  }

  // Enforce Seat Limits
  const currentSeats = await calculateBillableSeats(organizationId)
  const effectivePlan = getEffectivePlan(organization as { plan: Plan, planOverride?: Plan | null, proUntil?: Date | null })
  const seatLimit = PLAN_SEAT_LIMITS[effectivePlan]

  if (currentSeats >= seatLimit) {
      return { 
          error: "You've reached the maximum number of users for Pro. Pro is designed for small teams. Larger organizations require Enterprise for governance, audit, and access control. Please contact sales to expand your team." 
      }
  }

  const email = formData.get("email") as string
  const role = formData.get("role") as string || "PROVIDER"

  if (!email || !email.includes("@")) {
    return { error: "Invalid email address" }
  }

  // Check if already member
  const existingMember = await prisma.organizationMembership.findFirst({
    where: {
      organizationId,
      user: { email: email }
    }
  })

  if (existingMember) {
    return { error: "User is already a member of this organization." }
  }

  // Generate Token
  // We create a random token, hash it for DB, return raw to user.
  const token = randomBytes(32).toString("hex")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  try {
    await prisma.organizationInvite.create({
      data: {
        organizationId,
        email: email.toLowerCase(),
        role: role as MembershipRole, 
        tokenHash,
        expiresAt,
        createdByMembershipId: membership.id
      }
    })
  } catch (e) {
    console.error(e)
    return { error: "Failed to create invite." }
  }

  revalidatePath("/settings")
  
  // Construct the link
  // We use the host header to construct the full URL, or fall back to relative
  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  
  const inviteLink = `${protocol}://${host}/invite/accept?token=${token}`

  // Send Email (Async)
  const inviterName = membership.user.displayName || "A colleague"
  await sendInviteEmail(email, inviterName, organization.name, inviteLink)

  return { success: true, inviteLink }
}

export async function revokeInviteAction(inviteId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) return { error: "No organization context" }
  const { organizationId, membership } = ctx

  try {
    requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)
  } catch {
    return { error: "Permission denied" }
  }

  await prisma.organizationInvite.deleteMany({
    where: {
      id: inviteId,
      organizationId
    }
  })

  revalidatePath("/settings")
  return { success: true }
}

export async function removeMemberAction(memberId: string) {
    const ctx = await getOrganizationContext()
    if (!ctx) return { error: "No organization context" }
    const { organizationId, membership } = ctx
  
    try {
        requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)
    } catch {
        return { error: "Permission denied" }
    }

    if (memberId === membership.id) {
        return { error: "You cannot remove yourself." }
    }
  
    await prisma.organizationMembership.deleteMany({
      where: {
        id: memberId,
        organizationId
      }
    })

    // Update Billing
    await updateSubscriptionSeatCount(organizationId)
  
    revalidatePath("/settings")
    return { success: true }
}

export async function updateMemberRoleAction(memberId: string, newRole: MembershipRole) {
    const ctx = await getOrganizationContext()
    if (!ctx) return { error: "No organization context" }
    const { organizationId, membership } = ctx

    try {
        requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)
    } catch {
        return { error: "Permission denied" }
    }

    if (memberId === membership.id) {
        return { error: "You cannot change your own role." }
    }

    // Special check for OWNER transfer
    if (newRole === MembershipRole.OWNER && membership.role !== MembershipRole.OWNER) {
        return { error: "Only the current owner can transfer organization ownership." }
    }

    await prisma.organizationMembership.update({
        where: {
            id: memberId,
            organizationId
        },
        data: {
            role: newRole
        }
    })

    // Sync billing if role affects seat count (e.g. changing to/from READONLY)
    await updateSubscriptionSeatCount(organizationId)

    revalidatePath("/settings")
    return { success: true }
}
