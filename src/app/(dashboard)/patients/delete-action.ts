'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from '@/lib/auth-context'
import prisma from '@/lib/prisma'
import { PERMISSIONS, requirePermission } from '@/lib/permissions'

export async function deletePatient(patientId: string) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.DELETE_PATIENTS)

  // Verify ownership via organizationId in the query
  // Note: We use deleteMany just to be safe with the where clause,
  // even though ID is unique. It returns { count: n }.
  const result = await prisma.patient.deleteMany({
    where: {
      id: patientId,
      organizationId: organizationId
    }
  })

  if (result.count === 0) {
    throw new Error('Patient not found or access denied')
  }

  revalidatePath('/patients')
}