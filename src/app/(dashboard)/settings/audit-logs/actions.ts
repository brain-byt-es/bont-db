"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { Prisma } from "@/generated/client/client"

interface AuditLogFilters {
  action?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  // Only Owners and Clinic Admins can view audit logs
  requirePermission(membership.role, PERMISSIONS.MANAGE_TEAM)

  const where: Prisma.AuditLogWhereInput = {
    organizationId,
  }

  if (filters.action && filters.action !== "all") {
    where.action = filters.action
  }

  if (filters.userId && filters.userId !== "all") {
    where.actorMembership = {
      userId: filters.userId
    }
  }

  if (filters.dateFrom || filters.dateTo) {
    where.occurredAt = {
      gte: filters.dateFrom,
      lte: filters.dateTo
    }
  }

  return await prisma.auditLog.findMany({
    where,
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
    take: 250 // Increased limit for filtered views
  })
}

/**
 * Action to fetch unique action types and users for the filter dropdowns.
 */
export async function getAuditFilterOptions() {
    const ctx = await getOrganizationContext()
    if (!ctx) return { actions: [], users: [] }
    const { organizationId } = ctx

    const [actions, memberships] = await Promise.all([
        prisma.auditLog.findMany({
            where: { organizationId },
            distinct: ['action'],
            select: { action: true }
        }),
        prisma.organizationMembership.findMany({
            where: { organizationId, status: 'ACTIVE' },
            include: { user: { select: { id: true, displayName: true } } }
        })
    ])

    return {
        actions: actions.map(a => a.action),
        users: memberships.map(m => ({ id: m.user.id, name: m.user.displayName }))
    }
}
