'use server'

import { revalidatePath } from 'next/cache'
import { getOrganizationContext } from '@/lib/auth-context'
import prisma from '@/lib/prisma'

export async function deleteTreatment(treatmentId: string) {
  const { organizationId } = await getOrganizationContext()

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