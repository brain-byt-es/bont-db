'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from '@/lib/auth-context'
import prisma from '@/lib/prisma'
import { PERMISSIONS, requirePermission } from '@/lib/permissions'
import { updatePatientIdentifier } from '@/phi/patient-phi'

export async function updatePatient(patientId: string, formData: FormData) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId, membership } = ctx

  requirePermission(membership.role, PERMISSIONS.WRITE_PATIENTS)

  const patient_code = formData.get('patient_code') as string
  const birth_year = parseInt(formData.get('birth_year') as string)
  const notes = formData.get('notes') as string
  
  // Basic validation
  if (!patient_code || !birth_year) {
    throw new Error("Missing required fields")
  }

  // Verify existence and ownership first (optional but good for error messages)
  // or just let the updateMany/update fail silently or return count 0.
  // We'll use a transaction to update both schemas.

  await prisma.$transaction(async (tx) => {
    // 1. Update Public Data
    const publicUpdate = await tx.patient.updateMany({
      where: {
        id: patientId,
        organizationId: organizationId
      },
      data: {
        systemLabel: patient_code,
        notes: notes
      }
    })

    if (publicUpdate.count === 0) {
      throw new Error("Patient not found or access denied")
    }

    // 2. Update PHI Data via isolated service
    await updatePatientIdentifier(tx, patientId, organizationId, {
      birthYear: birth_year
    })
  })

  revalidatePath(`/patients/${patientId}`)
  revalidatePath('/patients')
}