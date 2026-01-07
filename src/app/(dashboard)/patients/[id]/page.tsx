import { notFound, redirect } from "next/navigation"
import PatientPage from "./client"
import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { PatientPhiInclude, getBirthYear } from "@/phi/patient-phi"
import { OrganizationPreferences } from "@/components/record-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const ctx = await getOrganizationContext()
  if (!ctx) redirect('/onboarding')
  const { organizationId } = ctx

  // Fetch patient
  const patient = await prisma.patient.findUnique({
    where: {
      id: id,
      organizationId: organizationId
    },
    include: {
      ...PatientPhiInclude // PHI schema join via isolated fragment
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
    birth_year: getBirthYear(patient),
    last_activity: treatments[0]?.encounterLocalDate.toISOString().split('T')[0]
  }

  const mappedTreatments = treatments.map(t => ({
    id: t.id,
    treatment_date: t.encounterLocalDate.toISOString(),
    treatment_site: t.treatmentSite,
    indication: t.indication,
    product: t.product?.name || 'N/A',
    total_units: t.totalUnits.toNumber(),
    status: t.status,
    patient: { patient_code: mappedPatient.patient_code }
  }))

    return (

      <PatientPage

        patient={mappedPatient}

        treatments={mappedTreatments}

            organization={{

                name: ctx.organization.name,

                preferences: ctx.organization.preferences as unknown as OrganizationPreferences

              }}

        

      />

    )

  }

  