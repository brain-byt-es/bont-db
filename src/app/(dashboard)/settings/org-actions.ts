"use server"

import { getOrganizationContext, getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { MembershipRole, OrganizationStatus } from "@/generated/client/enums"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logAuditAction } from "@/lib/audit-logger"

export async function deleteOrganizationAction() {
  const { userId } = await getUserContext()
  const ctx = await getOrganizationContext()

  if (!ctx) {
    return { error: "No active organization found." }
  }

  // 1. Check Permission
  if (ctx.membership.role !== MembershipRole.OWNER) {
    return { error: "Only the organization owner can delete the organization." }
  }

  // 2. Check Count of Active Organizations owned by user
  // We need to know if the user has *other* active organizations where they are OWNER (or just a member? The prompt says "1 ist IMMER aktiv", implying the user needs access to *some* system).
  // Usually, we prevent deleting the last one so the user isn't left stranded.
  
  const activeMemberships = await prisma.organizationMembership.count({
    where: {
      userId: userId,
      status: "ACTIVE",
      organization: {
        status: { in: [OrganizationStatus.ACTIVE, OrganizationStatus.DEMO] }
      }
    }
  })

  if (activeMemberships <= 1) {
    return { error: "You cannot delete your last active organization." }
  }

  try {
    // 3. Soft Delete (Close) Organization
    await prisma.organization.update({
      where: { id: ctx.organizationId },
      data: {
        status: OrganizationStatus.CLOSED
      }
    })

    await logAuditAction(ctx, "ORGANIZATION_DELETED", "Organization", ctx.organizationId)
  } catch (error) {
    console.error("Failed to delete organization:", error)
    return { error: "Failed to delete organization." }
  }

  // 4. Redirect
  // Since the current org is now closed, standard middleware/layout logic should pick the next available one.
  revalidatePath("/")
  redirect("/dashboard")
}
