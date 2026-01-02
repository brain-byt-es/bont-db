"use server"

import { revalidatePath } from "next/cache"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"
import { headers } from "next/headers"
import { MembershipRole } from "@/generated/client/client"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

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
  const { organizationId, membership } = ctx

  try {
    requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)
  } catch {
    return { error: "You do not have permission to invite members." }
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
  
    revalidatePath("/settings")
    return { success: true }
  }
