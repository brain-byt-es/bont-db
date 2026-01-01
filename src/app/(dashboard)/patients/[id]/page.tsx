import { notFound } from "next/navigation"
import PatientPage from "./client"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const { organizationId } = await getOrganizationContext()

  // Fetch patient
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
      organizationId: organizationId
    },
    include: {
      identifiers: true // Needed for birthYear if we want to display it properly, though UI type mismatch might occur
    }
  })

  if (!patient) {
    notFound()
  }

  // Fetch treatments
  const treatments = await prisma.encounter.findMany({
    where: {
      patientId: id,
      organizationId: organizationId,
      status: { not: "VOID" }
    },
    include: {
      product: { select: { name: true } }
    },
    orderBy: {
      encounterAt: 'desc'
    }
  })

  // Map to UI types
  const mappedPatient = {
    id: patient.id,
    notes: patient.notes,
    patient_code: patient.systemLabel || 'Unknown',
    birth_year: patient.identifiers?.birthYear || 0,
    last_activity: treatments[0]?.encounterLocalDate.toISOString().split('T')[0]
  }

  const mappedTreatments = treatments.map(t => ({
    id: t.id,
    treatment_date: t.encounterLocalDate.toISOString(),
    treatment_site: t.treatmentSite,
    indication: t.indication,
    product: t.product?.name || 'N/A',
    total_units: t.totalUnits.toNumber(),
    patient: { patient_code: mappedPatient.patient_code }
  }))

  return (
    <PatientPage
      patient={mappedPatient}
      treatments={mappedTreatments}
    />
  )
}