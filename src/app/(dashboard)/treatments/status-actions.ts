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

export async function reopenTreatmentAction(treatmentId: string) {
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
      data: { status: "DRAFT" }
  })

  revalidatePath(`/treatments/${treatmentId}`)
  return { success: true }
}
