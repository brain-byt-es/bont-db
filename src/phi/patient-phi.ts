import { Prisma } from "@/generated/client/client"

/**
 * Operations in this file touch the 'phi' schema (PatientIdentifier).
 * This directory is isolated for PHI compliance.
 */

export async function createPatientIdentifier(
  tx: Prisma.TransactionClient,
  data: {
    organizationId: string
    patientId: string
    birthYear: number
    ehrPatientId: string
  }
) {
  return await tx.patientIdentifier.create({
    data: {
      organizationId: data.organizationId,
      patientId: data.patientId,
      birthYear: data.birthYear,
      ehrPatientId: data.ehrPatientId,
    }
  })
}

export async function updatePatientIdentifier(
  tx: Prisma.TransactionClient,
  patientId: string,
  organizationId: string,
  data: { birthYear: number }
) {
  return await tx.patientIdentifier.updateMany({
    where: {
      patientId,
      organizationId,
    },
    data: {
      birthYear: data.birthYear,
    }
  })
}

/**
 * Fragment for including PHI data in Patient queries.
 * Use this to ensure PHI fields are only referenced from this isolated directory.
 */
export const PatientPhiInclude = {
  identifiers: true
} as const

/**
 * Safe extractor for Birth Year.
 */
export function getBirthYear(patient: { identifiers?: { birthYear: number | null } | null } | null) {
  return patient?.identifiers?.birthYear || 0
}
