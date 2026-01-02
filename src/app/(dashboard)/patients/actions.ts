"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { Subject } from "@/components/subjects-table"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function getPatients(): Promise<Subject[]> {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx

  const patients = await prisma.patient.findMany({
    where: {
      organizationId: organizationId,
      status: "ACTIVE"
    },
    include: {
      identifiers: true, // PHI schema join
      _count: {
        select: { encounters: true }
      },
      encounters: {
        orderBy: { encounterAt: 'desc' },
        take: 1,
        select: { encounterAt: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Map Prisma result to UI Subject interface
  return patients.map(p => {
    const lastEncounterDate = p.encounters[0]?.encounterAt 
    
    return {
      id: p.id,
      patient_code: p.systemLabel || 'N/A',
      // If identifiers is null (shouldn't be, but robust), default to 0
      birth_year: p.identifiers?.birthYear || 0, 
      notes: p.notes,
      record_count: p._count.encounters,
      last_activity: lastEncounterDate ? format(lastEncounterDate, 'yyyy-MM-dd') : null
    }
  })
}

export async function createPatient(formData: FormData) {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx
  const patient_code = formData.get('patient_code') as string
  const birth_year = parseInt(formData.get('birth_year') as string)

  if (!patient_code || !birth_year) {
    throw new Error("Missing required fields")
  }

  // Transactional creation: Patient (Public) + PatientIdentifier (PHI)
  await prisma.$transaction(async (tx) => {
    // 1. Create Public Patient Record
    const patient = await tx.patient.create({
      data: {
        organizationId,
        systemLabel: patient_code, // The visible code
        status: "ACTIVE"
      }
    })

    // 2. Create PHI Record
    await tx.patientIdentifier.create({
      data: {
        organizationId,
        patientId: patient.id,
        birthYear: birth_year,
        // For MVP, we use the patient UUID as the EHR ID if not provided externally
        ehrPatientId: randomUUID(), 
      }
    })
  })

  revalidatePath('/patients')
}
