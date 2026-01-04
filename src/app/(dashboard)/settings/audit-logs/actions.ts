"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

export async function getAuditLogs() {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  // Only Owners and Clinic Admins can view audit logs
  requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)

  return await prisma.auditLog.findMany({
    where: { organizationId },
    include: {
      actorMembership: {
        include: {
          user: {
            select: { displayName: true, email: true }
          }
        }
      }
    },
    orderBy: { occurredAt: 'desc' },
    take: 100 // MVP limit
  })
}
