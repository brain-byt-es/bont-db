"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"

export async function signTreatmentAction(treatmentId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const encounter = await prisma.encounter.findUnique({
      where: { id: treatmentId, organizationId }
  })

  if (!encounter) throw new Error("Not found")

  await prisma.encounter.update({
      where: { id: treatmentId },
      data: { status: "SIGNED" }
  })

  revalidatePath(`/treatments/${treatmentId}`)
  return { success: true }
}

export async function bulkSignTreatmentsAction(treatmentIds: string[]) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_TREATMENTS)

  if (!treatmentIds.length) return { count: 0 }

  const result = await prisma.encounter.updateMany({
    where: {
      id: { in: treatmentIds },
      organizationId,
      status: "DRAFT" // Only sign drafts to be safe
    },
    data: { status: "SIGNED" }
  })

  revalidatePath("/treatments")
  revalidatePath("/patients") // In case we are on patient detail
  return { count: result.count }
}
export async function reopenTreatmentAction(treatmentId: string, reason: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const encounter = await prisma.encounter.findUnique({
      where: { id: treatmentId, organizationId }
  })

  if (!encounter) throw new Error("Not found")

  await prisma.$transaction([
    prisma.encounter.update({
        where: { id: treatmentId },
        data: { status: "DRAFT" }
    }),
    prisma.auditLog.create({
      data: {
        organizationId,
        actorMembershipId: membership.id,
        action: "TREATMENT_REOPENED",
        resourceType: "Encounter",
        resourceId: treatmentId,
        details: { reason }
      }
    })
  ])

  revalidatePath(`/treatments/${treatmentId}`)
  return { success: true }
}
