'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from '@/lib/auth-context'
import prisma from '@/lib/prisma'
import { PERMISSIONS, requirePermission } from '@/lib/permissions'

export async function deleteTreatment(treatmentId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.DELETE_TREATMENTS)

  // Verify and delete
  const result = await prisma.encounter.deleteMany({
    where: {
      id: treatmentId,
      organizationId: organizationId
    }
  })

  if (result.count === 0) {
    throw new Error('Treatment not found or access denied')
  }

  revalidatePath('/treatments')
  revalidatePath('/patients')
}

export async function bulkDeleteTreatmentsAction(treatmentIds: string[]) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.DELETE_TREATMENTS)

  if (!treatmentIds.length) return { count: 0 }

  const result = await prisma.encounter.deleteMany({
    where: {
      id: { in: treatmentIds },
      organizationId
    }
  })

  revalidatePath('/treatments')
  revalidatePath('/patients')
  return { count: result.count }
}