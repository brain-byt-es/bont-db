"use server"

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PERMISSIONS, requirePermission } from "@/lib/permissions"
import { logAuditAction } from "@/lib/audit-logger"

export async function signTreatmentAction(treatmentId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  requirePermission(ctx.membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const encounter = await prisma.encounter.findUnique({
      where: { id: treatmentId, organizationId }
  })

  if (!encounter) throw new Error("Not found")

  await prisma.encounter.update({
      where: { id: treatmentId },
      data: { status: "SIGNED" }
  })

  await logAuditAction(ctx, "TREATMENT_SIGNED", "Encounter", treatmentId)

  revalidatePath(`/treatments/${treatmentId}`)
  return { success: true }
}

export async function bulkSignTreatmentsAction(treatmentIds: string[]) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  requirePermission(ctx.membership.role, PERMISSIONS.WRITE_TREATMENTS)

  if (!treatmentIds.length) return { count: 0 }

  const result = await prisma.encounter.updateMany({
    where: {
      id: { in: treatmentIds },
      organizationId,
      status: "DRAFT" // Only sign drafts to be safe
    },
    data: { status: "SIGNED" }
  })

  if (result.count > 0) {
      await logAuditAction(ctx, "TREATMENT_BULK_SIGNED", "Encounter", undefined, { count: result.count, ids: treatmentIds })
  }

  revalidatePath("/treatments")
  revalidatePath("/patients") // In case we are on patient detail
  return { count: result.count }
}
export async function reopenTreatmentAction(treatmentId: string, reason: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  requirePermission(ctx.membership.role, PERMISSIONS.WRITE_TREATMENTS)

  const encounter = await prisma.encounter.findUnique({
      where: { id: treatmentId, organizationId }
  })

  if (!encounter) throw new Error("Not found")

  // Update status
  await prisma.encounter.update({
      where: { id: treatmentId },
      data: { status: "DRAFT" }
  })

  // Log audit
  await logAuditAction(ctx, "TREATMENT_REOPENED", "Encounter", treatmentId, { reason })

  revalidatePath(`/treatments/${treatmentId}`)
  return { success: true }
}
